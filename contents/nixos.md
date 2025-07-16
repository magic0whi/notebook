# NixOS

## Installation

### ZFS

#### Concepts

- **Datasets**: Fundamental units of resources in a zpool, there are 4 types of datasets, e.g. file systems or volumes.

Reference: *zfsconcepts(7)*

- *`raidz`*: A vdev type that provides redundancy using parity, where `raidz1` offers single-parity (like RAID5. `raidz` is an alias for `raid1`), `raidz2` offers double-parity (like RAID6), and `raidz3` offers triple-parity for increased fault tolerance.
- **Mount Points**:

  ZFS automatically manages mounting and unmounting of file systems without requiring `/etc/fstab`. By default, file systems are mounted under `/<dataset>`, where `<dataset>` is the name of the file system in the ZFS namespace. The `mountpoint` property can be set to specify a custom mount location or set to `none` to prevent the file system from being mounted.

  The `mountpoint` property can be inherited; i.e. if `pool/home` has a mount point of `/export/stuff`, then `pool/home/user` automatically inherits `/export/stuff/user` as its mount point unless overridden.

Reference: *zpoolconcepts(7)*

#### Partition

Recommendations:
- **ESP**: It is recommended to allocate 512 MiB for the ESP to store boot loaders and related files.
- **Swap Space**: For systems supporting hibernation, allocate swap space equal to the size of RAM + GPU RAM. Using swap on a zvol is strongly discouraged, as resuming from hibernation may cause pool corruption.
- **ZFS zpool Partitions**: Create partitions for zpools and set their type to `bf00` (Solaris Root) to indicate they are used for ZFS.

To create a zpool with a RAID0-like configuration, we need each device being added as a separate vdev:
```shell-session
$ zpool create -m <mountpoint> <poolname> <vdevs>
```

> Each `vdev` is either a device or has the format:
> ```shell-session
> <vdev type> <device> ... <device>
> ```
> You can alter it as your pleasure if you need a RAID1+0-like zpool:
> ```shell-session
> zpool create -m <mountpoint> <poolname> \
>   mirror /dev/disk/by-id/1 /dev/disk/by-id/2 \
>   mirror /dev/disk/by-id/3 /dev/disk/by-id/4
> ```

A comprehensive example for :
```shell-session
# zpool create -m /mnt -o ashift=12 -O acltype=posix -O relatime=on -O xattr=sa \
-O dnodesize=legacy -O normalization=formD -O mountpoint=none -O canmount=off \
-O devices=off -O compression=zstd -O encryption=aes-256-gcm \
-O keyformat=passphrase -O keylocation=prompt \
zroot /dev/disk/by-partlabel/{zfsroot1,zfsroot2}
```

Breakdown:
- `-m mountpoint` Set the mount point for the root dataset.
- `-o property=value` Set the given pool properties.
- `-O file-system-property=value` Sets the given file system properties in the root file system of the pool.

Some Pool Properties (See *zpoolprops*(7) for a list of valid properties):
- `ashift=12` Pool sector size exponent, to the power of **2**. The value 0 (the default) means to auto-detect. The typical case is set `ashift=12` (which is `1<<12 = 4096`).

Some System Properties (See *zfsprops*(7) for a list of valid properties):
- `acltype=posix` Use POSIX ACLs.
- `relatime=on|off` Turning on causes the access time to be updated relative to the modify or change time. Access time is only updated if the previous access time was earlier than the current modify or change time or if the existing access time hasn't been updated within the past 24 hours.
- `xattr=sa` Use system-attribute-based xattrs (decrease disk I/O, reduce access time).
- `dnodesize=legacy` Specifies the size of dnodes.
- `normalization=formD` Perform a **unicode** normalization algorithm of file names whenever two file names are compared. If set other than `none`, the `utf8only` property is automatically set to `on`.
- `mountpoint=none` Prevent the file system from being mounted automatically by `zfs mount -a`
- `canmount=off` Similar to `mountpoint=none`, except that the dataset still has a normal `mountpoint` property, which can be inherited.
- `devices=off` Whether device nodes can be opened on this file system.

>  You may need:
>  - `-f` Force use of *vdevs*, even if they appear in use or specify a conflicting replication level.
>  - `-R <root>` Equivalent to `-o cachefile=none -o altroot=<root>`.

Create datasets:
```shell-session
# zfs create -o mountpoint=none zroot/ROOT
# zfs create -o mountpoint=/ -o canmount=noauto zroot/ROOT/default
# zfs create -o mountpoint=none zroot/data
# zfs create -o mountpoint=/home zroot/data/home
# zfs create -o mountpoint=/root zroot/data/home/root
# zfs create -o mountpoint=/var/log zroot/data/log
# zfs create -o acltype=posixacl zroot/data/log/journal
# zfs create -o mountpoint=/var/lib zroot/data/lib
```

Export & Import pools:
```shell-session
# zpool export zroot
# zpool import -d /dev/disk/by-id -R /mnt zroot -N
# zfs load-key zroot # If use native encryption
```

Manually mount rootfs dataset (since it uses `canmount=noauto)`, then mount all others datasets:
```shell-session
# zfs mount zroot/ROOT/default
# zfs mount -a
# zfs list -o name,mountpoint,encryption,canmount,mounted
```

Configure the root file system:
```shell-session
# zpool set bootfs=zroot/ROOT/default zroot
# zpool set cachefile=/etc/zfs/zpool.cache zroot # Create zpool.cache
# zpool list -o name,size,health,altroot,cachefile,bootfs
```

```shell-session
# fatlabel /dev/nvme0n1p1 "boot" # Or set file system label if already exists
# mount -m -o umask=077 /dev/disk/by-label/boot /mnt/boot/
# swapon /dev/disk/by-label/swap # TODO swap file system
# nixos-generate-config --root /mnt
```

Generate a hostId:
```shell-session
# head -c4 /dev/urandom | od -A none -t x4
```

```shell-session
# nixos-install --option substituters "https://mirrors.cernet.edu.cn/nix-channels/store"
```
