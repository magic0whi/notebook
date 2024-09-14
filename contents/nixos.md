# Some notes on NixOS

## Installation

Create a RAID-0 zpool (Each device added as a vdev)
```shell-session
$ zpool create -fm <mount> <pool> <ids>
```
