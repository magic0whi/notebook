# NixOS Installation

## Partition

Recommendations:
- **ESP**: It is recommended to allocate 512 MiB for the ESP to store bootloaders and related files.
- **Swap Space**: For systems supporting hibernation, allocate swap space equal to the size of RAM + GPU RAM. Using swap on a zvol is strongly discouraged, as resuming from hibernation may cause pool corruption.
- **ZFS zpool Partitions**: Create partitions for zpools and set their type to `0xbf00` (Solaris Root, GUID `6A85CF4D-1DD2-11B2-99A6-080020736631`) to indicate they are used for ZFS.

Partition Layout:
```plaintext
/dev/nvme0n1 (~512 GiB)
+----------------+---------------------------------------------------+
| /dev/nvme0n1p1 | 'ZFS zroot partition 2' (~477 GiB, type-id: 0xbf00) |
+----------------+---------------------------------------------------+

/dev/nvme1n1 (~1 TiB)
+----------------+-------------------------------------------------------+
| /dev/nvme1n1p1 | 'EFI system partition' (512 MiB, fat32, flags: boot   |
| /dev/nvme1n1p2 | 'swap partition' (40 GiB, linux-swap)                 |
| /dev/nvme1n1p3 | 'ZFS zroot partition 1' (~477 GiB, type-id: 0xbf00      |
| /dev/nvme1n1p4 | 'Windows 11 partition' (~436 GiB, ntfs)               |
+----------------+-------------------------------------------------------+
```

`/dev/nvme0n1` (ZFS-only disk):
```shell-session
# parted /dev/nvme0n1
# (parted) unit s # Use precise sector
# (parted) unit MiB # Or use IEC binary units
# (parted) mklabel gpt # Create a new GUID Partition Table
# (parted) mkpart 'ZFS zroot partition 2' 1MiB 100%
# # Set proper parttype for Discoverable Partitions Specification
# (parted) type 1 6A85CF4D-1DD2-11B2-99A6-080020736631
# (parted) print
# (parted) quit
```

`/dev/nvme1n1` (ESP, swap, ZFS, and Windows):
```shell-session
# parted /dev/nvme1n1
# (parted) unit MiB
# (parted) mklabel gpt
# (parted) mkpart 'EFI system partition' fat32 1MiB 513MiB
# (parted) set 1 esp on
# (parted) mkpart 'swap partition' linux-swap 513MiB 41473MiB # 40GiB
# (parted) mkpart 'ZFS zroot partition 1' 41473MiB 529858MiB # Same size as /dev/nvme0n1p1
# (parted) type 3 6A85CF4D-1DD2-11B2-99A6-080020736631
# (parted) mkpart 'Windows 11 partition' ntfs 529858MiB 100% # Reserve for Windows
# (parted) quit
```

> To check part type, run `lsblk -o +PARTTYPE`.


## Format

ESP:
```shell-session
# mkfs.fat -F32 -S4096 -n boot /dev/disk/by-partlabel/EFI\\x20system\\x20partition
# fatlabel /dev/disk/by-partlabel/EFI\\x20system\\x20partition 'boot'
```

Encrypted swap partition:
```shell-session
# cryptsetup -y -v --sector-size 4096 --pbkdf-memory=114514 --label swap luksFormat /dev/disk/by-partlabel/swap\\x20partition
# cryptsetup open /dev/disk/by-partlabel/swap\\x20partition swap
# mkswap /dev/mapper/swap && swapon /dev/mapper/swap
```

Encrypt partition for zpool:
```shell-session
# cryptsetup -y -v --sector-size 4096 --pbkdf-memory=114514 --label zroot1 luksFormat /dev/disk/by-partlabel/ZFS\\x20zroot\\x20partition\\x201
# cryptsetup open /dev/disk/by-partlabel/ZFS\\x20zroot\\x20partition\\x201 zroot1
# cryptsetup -y -v --sector-size 4096 --pbkdf-memory=114514 --label zroot2 luksFormat /dev/disk/by-partlabel/ZFS\\x20zroot\\x20partition\\x202
# cryptsetup open /dev/disk/by-partlabel/ZFS\\x20zroot\\x20partition\\x202 zroot2
```

## ZFS

### Concepts

- **Datasets**: Fundamental units of resources in a zpool, there are 4 types of datasets, e.g. file systems or volumes.
- *`raidz`*: A vdev type that provides redundancy using parity, where `raidz1` offers single-parity (like RAID5. `raidz` is an alias for `raid1`), `raidz2` offers double-parity (like RAID6), and `raidz3` offers triple-parity for increased fault tolerance.
- **Mount Points**:

  ZFS automatically manages mounting and unmounting of file systems without requiring `/etc/fstab`. By default, file systems are mounted under `/<dataset>`, where `<dataset>` is the name of the file system in the ZFS namespace. The `mountpoint` property can be set to specify a custom mount location or set to `none` to prevent the file system from being mounted.

  The `mountpoint` property can be inherited; i.e. if `pool/home` has a mount point of `/export/stuff`, then `pool/home/user` automatically inherits `/export/stuff/user` as its mount point unless overridden.

> Reference: `zfsconcepts(7)` and `zpoolconcepts(7)`

### Create

To create a zpool with a RAID0-like configuration, we need each device being added as a separate vdev:
```shell-session
$ zpool create -R <relative_mountpoint> <poolname> <vdevs>
```

> Each `vdev` is either a device or has the format:
> ```shell-session
> <vdev type> <device> ... <device>
> ```
> You can alter it as your pleasure if you need a RAID1+0-like zpool:
> ```shell-session
> zpool create -R <relative_mountpoint> <poolname> \
>   mirror /dev/disk/by-id/1 /dev/disk/by-id/2 \
>   mirror /dev/disk/by-id/3 /dev/disk/by-id/4
> ```

A comprehensive example:
```shell-session
# zpool create -R /mnt -o ashift=12 -O acltype=posix -O relatime=on -O xattr=sa \
-O dnodesize=auto -O normalization=formD -O mountpoint=/ -O canmount=off \
-O devices=off -O compression=zstd \
zroot /dev/mapper/{zroot1,zroot2}
```

Breakdown:
- `-R <root>` Equivalent to `-o cachefile=none -o altroot=<root>`.
- `-o property=value` Set the given pool properties.
- `-O file-system-property=value` Sets the given file system properties in the root file system of the pool.

Some Pool Properties (See `zpoolprops(7)` for a list of valid properties):
- `ashift=12` Pool sector size exponent, to the power of **2**. The value 0 (the default) means to auto-detect. The typical case is set `ashift=12` (which is `1<<12 = 4096`).

Some System Properties (See `zfsprops(7)` for a list of valid properties):
- `altroot` If set, this directory is prepended to any mount points within the pool.
- `acltype=posix` Use POSIX ACLs.
- `relatime=on|off` Turning on causes the access time to be updated relative to the modify or change time. Access time is only updated if the previous access time was earlier than the current modify or change time or if the existing access time hasn't been updated within the past 24 hours.
- `xattr=sa` Use system-attribute-based xattrs (decrease disk I/O, reduce access time).
- `dnodesize=legacy` Specifies the size of dnodes.
- `normalization=formD` Perform a **Unicode** normalization algorithm of file names whenever two file names are compared. If set other than `none`, the `utf8only` property is automatically set to `on`.
- `mountpoint=none` Prevent the file system from being mounted automatically by `zfs mount -a`
- `canmount=off` Similar to `mountpoint=none`, except that the dataset still has a normal `mountpoint` property, which can be inherited.
- `devices=off` Whether device nodes can be opened on this file system.

> You may need:
> - `-f` Force use of vdevs, even if they appear in use or specify a conflicting replication level.
> - `-m mountpoint` Set the mount point for the root dataset.

Create datasets:
```shell-session
# zfs create -o mountpoint=/ zroot/default
# zfs create zroot/nix
# zfs create zroot/home
# zfs create -o mountpoint=/root zroot/home/root
```

> Export & Import pools:
> ```shell-session
> # zpool export zroot
> # zpool import -d /dev/disk/by-id -R /mnt zroot -N
> # zfs load-key zroot # If use native encryption
> ```
> Mount all datasets:
> ```shell-session
> # zfs mount -a
> # zfs list -o name,mountpoint,encryption,canmount,mounted
> ```

Configure the root file system:
```shell-session
# zpool set bootfs=zroot/default zroot
# zpool set cachefile=/etc/zfs/zpool.cache zroot # Create zpool.cache
# zpool list -o name,size,health,altroot,cachefile,bootfs
```

```shell-session
# mount -m -o umask=077 /dev/disk/by-partlabel/EFI\\x20system\\x20partition /mnt/boot/
# nixos-generate-config --root /mnt --show-hardware-config # Generate hardware-configuration.nix
```
> Note we NEED to modify the `hardware-configuration.nix`.

Generate a `hostId`:
```shell-session
# head -c4 /dev/urandom | od -A none -t x4
```

```shell-session
$ git clone --depth=1 https://github.com/magic0whi/nixos_configs_flake.git && cd nixos_configs_flake
# nixos-install --option substituters 'https://mirrors.cernet.edu.cn/nix-channels/store' --no-channel-copy --flake .#proteus-nuc --root /mnt
# nixos-enter # Chroot to NixOS
```

## Enroll TPM key

```shell-session
# systemd-cryptenroll --tpm2-device=auto --tpm2-pcrs=0+7 /dev/disk/by-partlabel/swap\\x20partition
```

> ```shell-session
> # systemd-cryptenroll --wipe-slot=tpm2 /dev/disk/by-partlabel/swap\\x20partition
> ```

## Troubleshooting

### Failed to import zpool

The log shows:
```plaintext
cannot import 'zroot': pool was previously in use from another system.
Last accessed by NixOS (hostid=01919810) at Thu Jan  1 04:05:14 1970
The pool can be imported, use 'zpool import -f' to import the pool.
```

Try `zpool export -a` to safely unmount the zpool before reboot you NixOS installation medium, or
`boot.zfs.forceImportRoot = true;` to force import.

Ref: https://www.reddit.com/r/zfs/comments/oywb30/comment/h8cvvii/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button

### Boot into rescus mode with disabled root account

When the machine boots, interrupt the bootloader and add this to the bootloader command-line:
```bash
[...] rescue systemd.setenv=SYSTEMD_SULOGIN_FORCE=1
```

Ref: https://discourse.nixos.org/t/boot-into-rescue-mode-with-disabled-root-account/13801
