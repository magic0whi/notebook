# Some notes on NixOS

## Installation

Partition, create and set type to `bf00` (Solaris Root).

Create a RAID-0 zpool (aka. raidz1, each device added as a vdev)
```shell-session
$ zpool create -fm <mount> <pool> <ids>
```

```shell-session
# zpool create -fm /mnt -o ashift=12 -O acltype=posix -O relatime=on -O xattr=sa \
-O dnodesize=legacy -O normalization=formD -O mountpoint=none -O canmount=off \
-O devices=off -O compression=zstd -O encryption=aes-256-gcm \
-O keyformat=passphrase -O keylocation=prompt \
zroot /dev/disk/by-partlabel/{zfsroot1,zfsroot2}
```

- `-f` Forces use of *vdevs*, even if they appear in use or specify a conflicting replication level.
- `-m mountpoint` Set the mount point for the root dataset.
- `-o property=value` Set the given pool properties. See *zpoolprops*(7) for a list of valid properties.
- `-O file-system-property=value` Sets thjhe given file system properties in the root file system of the pool. See *zfsprops*(7) for a list of valid properties.
- `-R <root>` Equivalent to `-o cachefile=none -o altroot=<root>`

Some Pool Properties:
- `ashift=12` Pool sector size exponent, to the power of **2**. The value 0 (the default) means to auto-detect. The typical case is set `ashift=12` (which is `1<<12 = 4096`).

Some System Properties:
- `acltype=posix` Use POSIX ACLs.
- `relatime=on|off` Turning on causes the access time to be updated relative to the modify or change time. Access time is only updated if the previous access time was earlier than the current modify or change time or if the existing access time hasn't been updated within the past 24 hours.
- `xattr=sa` Use system-attribute-based xattrs (decrease disk I/O, reduce access time).
- `dnodesize=legacy` Specifies the size of dnodes.
- `normalization=formD` Perform a **unicode* normalization algorithm of file names whenever two file names are compared. If set other than `none`, the `utf8only` property is automatically set to `on`.
- `mountpoint=none` Prevent the file system from being mounted automatically by `zfs mount -a`
- `canmount=off` Similar to `mountpoint=none`, except that the dataset still has a normal `mountpoint` property, which can be inherited.
- `devices=off` Whether device nodes can be opened on this file system.

Some of *zpoolconcepts*(7)
- `raidz`, `raidz1`, `raidz2`, `raidz3`: `raidz` vdev type is an alias for `raid1`. The `raidz1` specifies single-parity; `raidz2` specifies double-parity; `raidz3` specifies triple-parity.
- Mount Points: ZFS automatically manages mounting and unmounting file systems without the need of `/etc/fstab`.

  By default, file systems are mounted under `/path`, where *path* is the name of the file system in the ZFS namespace.

  A file system can have a mount point set in the `mountpoint` property. `mountpoint=none` prevents the file system from being mounted.

  The `mountpoint` property can be inherited, i.e. if `pool/home` has a mount point of `/export/stuff`, then `pool/home/user` automatically inherits a mount point of `/export/stuff/user`.
