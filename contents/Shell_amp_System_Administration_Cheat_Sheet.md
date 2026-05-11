# Shell & System Administration Cheat Sheet

## 1. Shell Basics

### Keyboard Shortcuts

| Key | Description |
| --- | ----------- |
| `<C-b>` | Move back a char |
| `<C-f>` | Move forward a char |
| `<M-b>` | Move back a word |
| `<M-f>` | Move forward a word |
| `<C-s>` | Pause STDOUT |
| `<C-q>` | Resume STDOUT (Useful if shell freezes from `<C-s>`) |
| `<C-r>` | Enter history search mode |
| `<C-g>` | Leave history search mode (Or break out to a newline) |
| `<C-m>` | Same as `<CR>` (Enter key) |
| `<M-h>` | Open manual for current command |

### Command Information

- `type` Show command type (built-in or outer).
- `whereis` Show program path and its manual.
- `whatis` Show a program's manual.
- `help xxx` Fast help for shell built-in commands.
- `history` Show shell history, which can be used along with `fc`.

### Redirects

- Redirecting Output (Write, override): `>`
- Appending Redirected Output: `>>`
- Here Strings: `<<<`
- Here Documents:
  ```bash
  $ cat <<[-]EOF
  111
  222
  333
  EOF
  ```
  *Note: The optional `-` trims the `<tab>`.*
- Process Substitution: `<(<cmd>)`
  ```bash
  cat <(echo 233) # Process Substitution generate a temporary file with content `233`
  ```

### Shell Variables

- `$@`: Parameters in an array type
- `$#`: Number of arguments.
- `$$`: Current shell's PID.
- `declare -i` defines an integer variable:
  ```bash
  x=5; y=3
  declare -i z=$x+$y
  z=z+3 # Integer variable can do arithmetic directly
  k=$(($x+$y)) # Do arithmetic but the type of 'k' still remains string
  ```

### Variable Parameter Expansions

| Key | Description |
| --- | --- |
| `::n` | Cut `n` chars from left to right if `n` is positive, otherwise right to left if negative |
| `:n` | Cut to end, start from column `n`, if `n` is negative then right to left (use `:(-n)` or `: -n`) |
| `:x:y` | Cut `y` chars start from column `x` |
| <code style="white-space: nowrap;">${food:-Cake}</code> | Defaults to `Cake` if `$food` does not exist |

| `STR=/path/to/foo.cpp` | Description |
| ------------------------ | ----------- |
| `${STR%/*}`      | `/path/to` (Cut from right to left, single `%` means non-greedy) |
| `${STR#*/}`      | `path/to/foo.cpp` (Cut from left to right, single `#` means non-greedy) |
| `${STR%%/to*}`   | `/path` (Two `%` is greedy) |
| `${STR##*.}`     | `cpp` (Two `#` is greedy) |
| `${STR/o/b}`     | `/path/tb/foo.cpp` (String substitution, single `/` means non-greedy) |
| `${STR//o/b}`    | `/path/tb/fbb.cpp` (Two `/` is greedy) |

## 2. Shell Scripting & Control Flow

### IF Statement in Bash

#### Integer Operator

| Bash | C++ | Name |
| ---- | --- | ---- |
| `-eq` | `==` | Equal |
| `-ne` | `!=` | Note equal |
| `-gt` | `>` | Greater |
| `-ge` | `>=` | Greater or equal |
| `-lt` | `<` | Lesser |
| `-le` | `<-` | Lesser or equal |

#### File Operator

| File Operator | Name |
| ------------- | ---- |
|`-e`         | Exist |
|`-r`         | Readable |
|`-w`         | Writable |
|`-x`         | Executable |
|`-f`         | Normal file |
|`-d "dir"`   | Directory exists |
|`! -d "dir"` | Directioy not exists |
|`-c`         | Char file |
|`-b`         | Block file |
|`-s`         | Size is not zero |
|`-t`         | TTY file |

#### String Operator

```plaintext
# POSIX sh
str1 = str2
str1 > str2  # Compare by alphabetical order
str1 < str2
-z str       # Length is zero
-n str       # Length is non-zero

# Bash specific (Can use pattern matching '[[' ']]')
str1 == str2
str1 != str2
str1 =~ regex # Extended regular expression
```

#### Logical Operator

`-a` (And), `-o` (Or), `!` (Not), `[] && []` (And), `[] || []` (Or).

### Loops & Functions

- **For loop example**:
  ```bash
  #!/usr/bin/env sh
  set -eufo pipefail
  for ((i=0; i<=10; i++)); do printf " $i"; done # 0 1 2 3 4 5 6 7 8 9 10
  echo
  for i in {0..10}; do printf " $i"; done          # 0 1 2 3 4 5 6 7 8 9 10
  echo
  for i in {0..10..2}; do printf " $i"; done       # 0 2 4 6 8 10
  ```
- **Shell Functions**:
  ```bash
  #!/usr/bin/env sh
  set -eufo pipefail
  function sum() {
    echo '$#: '$# # Number of parameters
    echo '$*: '$* # Parameters in string type
    echo '$0: '$0 # The 0th parameter (the executed file name itself)
    echo '$1: '$1 # The first parameter
    echo '$@ '$@ # Parameters in an array type
  }
  echo "sum 1 2 7 'a'"
  sum 1 2 7 'a'
  ```

### Handling STDIN, STDOUT, STDERR in C

How do shell arguments be processed with `stdin`, `stdout`, `stderr`?

```c
#include<stdio.h>
int main(int argc, char *argv[]) {
  int i = 0;
  char c;

  for (; i < argc; ++i) fprintf(stdout, "%d: %s\n", i, argv[i]);
  fflush(stdout);

  c = fgetc(stdin);
  while (c != EOF) { // Convert to UPPERCASE
    if (c >= 'a' && c <= 'z') c += 'A' - 'a';
    fputc(c, stdout);
    c = fgetc(stdin);
  }
  fflush(stdout);

  fprintf(stderr, "I am stderr\n");
  fflush(stderr);
}
```

```bash
clang test.c -o test && ./test 1 2 3 a b c <<EOF
hello world
EOF
```

### Globbing

- **Bash Extended Globbing**

| Glob | Regular Expression Equivalent |
| --- | --- |
| `*` | `.*` |
| `?` | `.` |
| `[a-z]` | SAME |
| `?(pattern)` | `(regex)?` |
| `*(pattern)` | `(regex)*` |
| `+(pattern)` | `(regex)+` |
| `@(pattern)` | `(regex){1}` |
| `!(pattern)` | `^((?!regex).)*$` |

- **Exclusive Delete**
  - *Bash*: `shopt -s extglob && rm -r !(file1|file2|dir)`
  - *Zsh*: `setopt extendedglob && rm -r ^(file1|file2|dir)`

### Trap

| Signal Number | Signal Name | Default Action |
| ------------- | ----------- | -------------- |
| 0  | EXIT | Nothing                                                    |
| 2  | INT  | Terminate (Interrupt, weakest, `<C-c>`)                    |
| 15 | TERM | Terminate (Exit cleanly, normal)                           |
| 1  | HUP  | Terminate (Hangup, normal, sent from SSH disconnect)       |
| 3  | QUIT | Terminate (Harshest but still handle ignorable, core dump) |
| 9  | KILL | Terminate (Unconditionally)                                |

Reset signal `TERM`'s action to default: `trap - TERM`

### Set Options

`set -eufo pipefail`

- `-e`: Exit immediately if any command has a non-zero exit status.
- `-u`: Exit immediately on unassigned variable references.
- `-f`: Disables pathname expansion (globbing).
- `-o pipefail`: Prevents pipeline errors from being masked.

## 3. Text & Data Manipulation

- **gawk**

  Filter column 3 with value >= 90: `awk '$3 >= 90 {print}'`

  - `$0`: Whole line. `NR`: Current line number. `NF`: Word count of current line.
    - e.g. Ignore first line `awk 'NR > 1 {print $0}'`
  - `BEGIN` / `END`: Execute at start/end of file.
  - Variables e.g.,
    - Calculate sum: `awk 'BEGIN {sum = 0} {sum = sum + $3} END {avg = sum / NR; print NR, sum, avg}'`
    - Char count `awk '{cc = cc + length($0) + 1} END {print NR, wc}'` (Validate by `wc -ml`. The extra +1 is due to `\n` at each end of line)
  - Delimiter: `awk -F':'`
- **grep**

  Find in files recursively: `grep -iRl "text" ./`

  - `-o` (matching only), `-n` (line number), `-v` (reverse), `-i` (case-insensitive), `-r` (recursive), `-R` (dereference recursive).
- **Ripgrep (rg)**

    Search hidden files, follow symlinks, bypass ignores, PCRE2 regex, smart case: `rg --no-ignore -. -LSP -g \!node_modules "awk" ./`
- **sort**

  Numeric sort on the 3rd column: `sort -n -k 3 scores.txt | less`

  - `-r` (Reverse), `-u` (Remove duplicates based on match, unlike `uniq` which requires exact lines).
- **tr**

  Convert to UPPERCASE: `tr 'a-z' 'A-Z'` (or `tr '[:lower:]' '[:upper:]'`).
- **xargs**

  `xargs` formats the stdin as parameters to the command.

  Calculate numbers and '-' in files: `find . -name '*[0-9]*.txt' | xargs egrep -o '^[0-9-]+' | wc -l`
- **diff**

  Format explanation: `d(elete)`, `c(hange)`, `a(dd)`.

  e.g., `130d129` (delete line 130, align to 129); `249a130,131` (add lines 130-131 to former's 249); `271,373c163,271` (replace lines 163, 271 to former's 271, 373).

- **sed**
  - Exchange first and second column using groups `()`: `sed -r 's/^([0-9]*)([\t ]*)([^\t ]*)/\3\2\1/' data.txt`
  - Delete line starting with `std`: `sed -r '/^std/d' main.txt`

> Note: The numbering of the groups depend on the appear order of the left parentheses `(`:
> ```plaintext
> (( )( )( ))
> 12  3  4
> ```

## 4. File System & Storage

- **Filesystem Concepts**
- *Inodes*: Stores file properties and pointer table of blocks. A file corresponds to one inode, block stores the content of the file.
- *Hard Links*: Same file, multiple names. File only. Cannot cross filesystems.
- *Symlinks*: Different file, same name. Files/directories. Can cross filesystems.

> Directories have pointer `./` and `../`, which increase the hard link count.

- **chmod**
  - Recursively give directories read & execute: `find /path/to/dir -type d -exec chmod 755 {} \+`
  - Recursively give files read privileges: `find /path/to/dir -type f -exec chmod 644 {} \+`
- **rsync**
  - Copy and preserve all attributes: `rsync -aP $SOURCE/ $TARGET/`
  - Copy without permission/owner (keep touch times): `rsync -rltP --no-owner --no-group --no-perms $SOURCE/ $TARGET/`
  - Remote sync with compression & delete: `rsync -azP -zc=zstd --exclude={"file1","path/to/file2"} --delete $SOURCE/ $TARGET/`

  Arguments explanation:
  - `-a`: Equivalent to `-rlptgoD`. `-r` (Recursive), `-l` (links), `-p` (perms), `-t` (times), `-g` (group), `-o` (owner)
  - `-D`: Same as `--devices --specials`
  - `-P`: Same as `--partial --progress`
  - `-z` (Compress)
  - `-zc=STR` (compress-choice)
- **ACLs**
  - Copy file ACL: `getfacl file1 | setfacl --set-file=- file2`
  - Sync default ACL to access ACL: `getfacl --default dir | setfacl --set-file - dir`
  - Delete: `-x` (remove specific), `-k` (remove default), `-b` (remove all). Add `-R` for recursive.
- **dd (GPT Backup/Restore)**
  - Backup: `dd if=/dev/sda of=gpt-partition.bin bs=512 count=34`
  - Restore: `dd if=gpt-partition.bin of=/dev/sda bs=512 count=34`
- **mdadm (FakeRAID)**
  - Erase metadata: `mdadm --zero-superblock /dev/nvme0n1p2`
  - Stop array: `mdadm --stop /dev/md127`
- **nvmecli**
  - Get LBA format: `sudo nvme id-ns /dev/nvme0n1 -H | grep 'LBA Format'` *(Note: Most SSDs use 4096 byte physical sectors, even if they report 512).*
- **Misc Storage**
  - `findmnt`: List all mounted filesystems.
  - Tell OS of partition table changes: `partprobe`

## 5. System Administration

### Arch Linux Clean Build

```bash
# Prepare
RAMDISK_SIZE=$(($(free -m | awk '/Mem/ {print $7}')/2))
sudo mount --mkdir -t tmpfs -o defaults,size=${RAMDISK_SIZE}M tmpfs /tmp/aur_chroot
sudo dd if=/dev/zero of=/tmp/aur_chroot/ramdisk status=progress bs=1M count=$RAMDISK_SIZE
sudo mkfs.btrfs -m single -f /tmp/aur_chroot/ramdisk
sudo mount --mkdir -t btrfs -o loop,sync,compress=zstd /tmp/aur_chroot/ramdisk \
  /tmp/aur_chroot/overlay
sudo chown proteus: /tmp/aur_chroot/overlay
CHROOT=/tmp/aur_chroot/overlay

# Build via paru
paru -S --chroot=$CHROOT <Packages>

# Build manually
sudo mkarchroot $CHROOT/root base-devel
sudo makechrootpkg -c -r $CHROOT [-I ../Build_Deps/Build_Deps.pkg.tar.zst]

# Unmount
sudo umount $CHROOT /mnt/chroots/tmp
```

### NixOS / systemd

- Re-run the system activation script: `sudo /run/current-system/bin/switch-to-configuration test`
- Get a process's env vars: `sudo cat /proc/$(pidof -s nix-daemon)/environ | tr '\0' '\n'`
- Modify a service temporarily: `sudo systemctl --runtime edit <Service>` (Restore with `--runtime revert`).
- Recreate `tmpfiles.d`: `sudo systemd-tmpfiles --create` (List with `--cat-config`).

### macOS Time Calibration

```bash
sudo sntp -sS time.apple.com
```

### Libvirt / QEMU

Run `--print-xml | less` to dump `.xml` for debugging.

#### Install an Arm Cortex-A53 machine

```bash
virt-install --connect qemu:///system \
  --memory 2048 --memorybacking hugepages.page0.size=2048 \
  --arch=aarch64 --cpu cortex-a53 --machine virt \
  --vcpus vcpu=4,vcpu.placement=static --iothreads 1 \
  --cputune vcpupin0.vcpu=0,vcpupin0.cpuset=2,vcpupin1.vcpu=1,vcpupin1.cpuset=10,vcpupin2.vcpu=2,vcpupin2.cpuset=3,vcpupin3.vcpu=3,vcpupin3.cpuset=11,emulatorpin.cpuset='1,9',iothreadpin0.iothread=1,iothreadpin0.cpuset='1,9' \
  --cpu topology.sockets=1,topology.dies=1,topology.cores=4,topology.threads=1,numa.cell0.memory=2048,numa.cell0.unit=MiB,numa.cell0.memAccess=shared \
  --osinfo archlinux \
  --disk size=10,format=qcow2,driver.cache=none,driver.io=native,driver.discard=unmap,driver.iothread=1,driver.queues=4,driver.iommu=on,target.bus=virtio \
  --boot firmware=efi,loader=/usr/share/edk2/aarch64/QEMU_CODE.fd,loader.readonly=yes,loader.type=pflash,nvram.template=/usr/share/edk2/aarch64/QEMU_VARS.fd,boot0.dev=network,boot1.dev=hd \
  --features gic.version=3,kvm.hidden.state=off,pmu.state=on \
  --clock offset=localtime,timer0.name=rtc,timer0.tickpolicy=catchup,timer0.track=guest,timer1.name=pit,timer1.tickpolicy=delay \
  --network direct,trustGuestRxFilters=yes,source=macvtap0,source.mode=vepa,model=virtio,driver.iommu=on \
  --controller virtio-serial,driver.iommu=on \
  --video virtio,model.vram=16384,model.heads=1 \
  --watchdog i6300esb \
  --rng /dev/random,model=virtio,driver.iommu=on \
  --tpm emulator,backend.version=2.0 \
  --memballoon virtio,driver.iommu=on \
  --iommu virtio \
  --panic pvpanic \
  --import
```

#### Install a RISC-V machine

```bash
virt-install --connect qemu:///system \
  --memory 2048 --memorybacking hugepages.page0.size=2048 \
  --arch riscv64 --machine virt \
  --vcpus vcpu=4,vcpu.placement=static --iothreads 1 \
  --cputune vcpupin0.vcpu=0,vcpupin0.cpuset=2,vcpupin1.vcpu=1,vcpupin1.cpuset=10,vcpupin2.vcpu=2,vcpupin2.cpuset=3,vcpupin3.vcpu=3,vcpupin3.cpuset=11,emulatorpin.cpuset='1,9',iothreadpin0.iothread=1,iothreadpin0.cpuset='1,9' \
  --cpu topology.sockets=1,topology.dies=1,topology.cores=4,topology.threads=1,numa.cell0.memory=2048,numa.cell0.unit=MiB,numa.cell0.memAccess=shared \
  --osinfo archlinux \
  --disk size=10,format=qcow2,driver.cache=none,driver.io=native,driver.discard=unmap,driver.iothread=1,driver.queues=4,driver.iommu=on,target.bus=virtio \
  --boot loader=/usr/share/qemu/opensbi-riscv64-generic-fw_dynamic.bin,boot0.dev=network,boot1.dev=hd \
  --features kvm.hidden.state=off \
  --clock offset=localtime,timer0.name=rtc,timer0.tickpolicy=catchup,timer0.track=guest,timer1.name=pit,timer1.tickpolicy=delay \
  --network direct,trustGuestRxFilters=yes,source=macvtap0,source.mode=vepa,model=virtio,driver.iommu=on \
  --controller virtio-serial,driver.iommu=on \
  --video virtio,model.vram=16384,model.heads=1 \
  --watchdog i6300esb \
  --rng /dev/random,model=virtio,driver.iommu=on \
  --tpm emulator,backend.version=2.0 \
  --memballoon virtio,driver.iommu=on \
  --import
```

### ACPI Tables (DSDT / SSDT)

Differentiated System Description Table / System Service Descriptor Table

*Example: Fixing s2idle issue on Lenovo Yoga Air 14s APU8 (aka. Yoga Slim 7 Gen 8 14APU8).*

1. **Extract DSDT**: `cat /sys/firmware/acpi/tables/DSDT > dsdt.dat`
2. **Disassemble**: `iasl -d dsdt.dat`
3. **Modify**: `vim dsdt.dsl`
4. **Compile to AML**: `iasl -tc dsdt.dsl | grep Errors`
5. **Extract SSDT**: `for i in /sys/firmware/acpi/tables/SSDT*; do sudo cat $i > ${i##*/}; done`
6. **Disassemble**: `iasl -d SSDT*`
7. **Modify**
  ```bash
  rg "SB.PCI0.GPP8.NVME" SSDT*.dsl
  # Found keywords in SSDT14.dsl, comment out it
  vim SSDT14.dsl
  ```
7. **Compile to AML**: `iasl -tc SSDT14.dsl`
8. **Create `cpio` archive for initramfs**:
  ```bash
  mkdir -p kernel/firmware/acpi
  cp dsdt.aml SSDT14.aml kernel/firmware/acpi # dsdt.aml is optional if it keep untouched
  find ./kernel | cpio -o -H newc > patched_acpi
  ```

> To extract a `cpio` archive
> ```bash
> cpio -iv -H newc < patched_acpi
> iasl -d kernel/firmware/acpi/SSDT14.aml
> ```
> `-o` (Copy-out), `-H newc` (use new SVR4 portable format), `-i` Copy-in, `-v` (Verbose)

### Kernel Interface / D-Bus

- UUID Gen: `cat /proc/sys/kernel/random/uuid`
- Battery Capacity: `cat /sys/class/power_supply/<name>/capacity`
- Network Interfaces: `ip link` or `ls /sys/class/net`
- DRM Monitor Modes: `cat /sys/class/drm/card1/card1-eDP-1/modes`
- D-Bus invoke method (Inhibit `clight`): `busctl --user call org.clight.clight /org/clight/clight org.clight/clight Inhibit b true`
- D-Bus inspect: `busctl --user introspect org.clight.clight /org/clight/clight org.clight.clight`
- D-Bus check property: `busctl --user get-property org.clight.clight /org/clight/clight org.clight.clight Inhibited`
- Show module's current options:
  - `cat /sys/module/<module_name>/parameters/modeset`
  - `sudo systool -v -m <module_name>`

### Reset User Fail Lock

```bash
faillock --user <username> --reset
```

## 6. Networking, Security & Identity

### OpenLDAP & SSSD

- **OpenLDAP Search (Manager permission)**:
  ```bash
  ldapsearch -x -H 'ldaps://ldap.proteus.eu.org:636' \
  -D 'cn=Manager,dc=proteus,dc=eu,dc=org' -W \
  -b 'ou=People,dc=proteus,tailba6c3fdc=eu,dc=org' '(objectClass=*)' | less
  ```
- **SSSD Domain & Cache**:
  - List domain: `sudo sssctl domain-list`
  - Show domain status: `sudo sssctl domain-status LDAP`
  - Expire all cache: `sudo sssctl cache-expire -E`
  - Get remote user: `getent passwd proteus@ldap`
  - Get remote group: `getent group storage@ldap`
  - Try authentication a user:
    ```bash
    ls /etc/pam.d
    sudo sssctl user-checks proteus -a auth -s login
    ```

### OpenSSL Self-Signing

1. **Generate CA Certificate & CA Key**:
  ```bash
  openssl req -noenc \
    -newkey EC -pkeyopt ec_paramgen_curve:P-384 -keyout proteus_ca.priv.pem \
    -x509 -new -sha384 -days 730 \
    -subj '/C=JP/ST=Toukyouto/L=Setagayaku Kitazawa/O=Homo114514/OU=Yajuu Sa-ba-/CN=Homo home/emailAddress=sudaku233@outlook.com' \
    -addext "keyUsage=critical,keyCertSign,cRLSign" \
    -out proteus_ca.pub.pem
  ```
2. **Generate CSR (Certificate Signing Request) & Server Key**:
  ```bash
  openssl req -noenc \
    -newkey EC -pkeyopt ec_paramgen_curve:P-384 -keyout proteus_server.priv.pem \
    -new -sha384 \
    -subj '/C=JP/ST=Toukyouto/L=Setagayaku Kitazawa/O=Homo114514/OU=Yajuu Sa-ba-/CN=*.tailba6c3f.ts.net/emailAddress=sudaku233@outlook.com' \
    -out proteus_server.csr
  ```
3. **Generate Certificate (Sign CSR with CA)**:
  ```bash
  openssl x509 -CA proteus_ca.pub.pem -CAkey proteus_ca.priv.pem -CAserial proteus_ca.srl \
    -days 730 -sha384 \
    -extfile <(<<EOF
  subjectAltName = DNS:localhost,DNS:*.tailba6c3f.ts.net,DNS:*.proteus.eu.org,DNS:*.s3.proteus.eu.org,DNS:*.s3-pub.proteus.eu.org
  authorityKeyIdentifier = keyid,issuer
  basicConstraints = CA:FALSE
  keyUsage = digitalSignature, keyEncipherment
  extendedKeyUsage=serverAuth
  EOF
  ) \
    -req -in proteus_server.csr -out proteus_server.pub.pem
  ```

> First time use `-CAcreateserial` to generate `proteus_ca.srl`, afterwards using `-CAserial proteus_ca.srl`.

Show information:
```bash
openssl ec -text -noout -in proteus_server.priv.pem
openssl req -text -verify -in proteus_server.csr
openssl x509 -noout -text -in proteus_server.csr
```

### SSH & Tunnels

- Stop remote control connection: `ssh -O stop proteus@proteus-desktop`
- X11vnc via SSH Tunnel: `ssh -t -L 5900:localhost:5900 <REMOTE> 'sudo x11vnc -localhost -display :0 -auth $(find /var/run/sddm/ -type f)'`
- `ssh-keygen`:
  - Show fingerprint: `ssh-keygen -l -f /path/to/key` (`-E md5` for coloned)
  - Regenerate host keys: `rm /etc/ssh/ssh_host_* && ssh-keygen -A`
  - Modify comment: `ssh-keygen -c -C <Comment> -f /path/to/key`
  - Show public key: `ssh-keygen -y -f /path/to/priv.key`

### BIND / DNS

- Generate `rndc` key: `tsig-keygen -a hmac-sha384 custom`
  - `rndc reconfig`, `rndc status`, `rndc dnssec -status proteus.eu.org`

### Other Networking

- **Iproute2 (ss)**: List sockets: `ss -s` | Find UDP port: `ss -lnptu | grep $PORT`

  `-l` (Listening), `-n` (Numeric), `-p` (Processes), `-t` (TCP), `-u` (UDP)
- **certbot**: Cloudflare wildcard registration:
  ```bash
  certbot certonly --dns-cloudflare --dns-cloudflare-credentials \
    --server https://acme-v02.api.letsencrypt.org/directory \
    --email <EMAIL> --agree-tos --no-eff-email -d '*.proteus.eu.org' \
    ~/.secrets/cloudflare.ini
  ```
- **GnuPG**: Fix "No assurance" warning by editing key trust level (`gpg --edit-key` > `trust` > `5`).

## 7. Multimedia, Hardware & Desktop

### Video & Display

- **Launch a game with FSR1, VRR, MangoHud in Steam:**: `gamescope -w 1728 -h 1080 -W 2944 -H 1840 --adaptive-sync -F fsr --fsr-sharpness 10 -- env LD_PRELOAD='...' sh ./cream.sh %command%`
- **GPU Environment Variables**:
  ```bash
  __EGL_VENDOR_LIBRARY_FILENAMES='/usr/share/glvnd/egl_vendor.d/10_nvidia.json'
  __GLX_VENDOR_LIBRARY_NAME=nvidia

  VK_ICD_FILENAMES='/usr/share/vulkan/icd.d/nvidia_icd.json'

  lspci -D | grep VGA
  DRI_PRIME=pci-0000_06_00_0 glxinfo | grep 'OpenGL renderer'

  ls /usr/lib/dri/*_dri.so
  MESA_LOADER_DRIVER_OVERRIDE=iris

  ls /usr/lib/dri/*_drv_video.so
  LIBVA_DRIVER_NAME=radeonsi vainfo --display drm --device /dev/dri/amd
  ```

- **ddcutil**: Adjust hardware monitor brightness: `ddcutil -l C340SCA setvcp 10 - 5`
- **yt-dlp**:
  - List formats: `yt-dlp -F '<URL>'`
  - Download best specific format: `yt-dlp -f 'bestvideo*+bestaudio/best' '<URL>'`
  - Interactive format selector `-f -`
  - Auto extract cookies from browser: `--cookies-from-browser firefox`
  - `--audio-multistreams`: Allow multiple audio streams to be merged into a single file;
  - `--video-multistreams`: Allow multiple video streams to be merged into a single file.
  -  Format Selection:
    - `b*`, `best*`: Select the best quality format that **contains either** a video or an audio or both (i.e.; `vcodec!=none` or `acodec!=none`).
    - `b`, `best`: Select the best quality format that **contains both** video and audio. Equivalent to `best*[vcodec!=none][acodec!=none]`.
    - `/`: Logical `Or`



### Binary File Modify

- Dump: `xxd in.bin > out.txt`
- Revert: `cat out.txt | xxd -r > mod.bin`

### PDF Manipulation

- Extract images: `pdfimages -all in.pdf out_dir/`
- Regenerate: `img2pdf --output out.pdf -s 600dpi [1-5].jpg`
  ```bash
  img2pdf --output out.pdf \
    --creator 'Canon SC1011' \
    --producer 'IJ Scan Utility' \
    --creationdate 'Wed Mar 20 16:33:38 2024 CST' \
    -D \
    --engine internal \
    -s 600dpi \
    [1-5].jpg
  ```
- Show infomation: `pdfinfo out.pdf`
- Show signature: `qpdf --json example.pdf | jq '.[] | arrays | to_entries[].value[].value? | select(."/Type" == "/Sig")' | bat -ljson`

### Bluetooth Dual Boot Pairing

Extract keys from Windows bitlocker partition to sync on Linux:

```bash
sudo cryptsetup open --type=bitlk /dev/nvme0n1p3 win11 <<<XXXXXX
sudo mount -t ntfs3 /dev/mapper/win11 /mnt/win11
cd /mnt/win11/Windows/System32/config
sudo chntpw -e SYSTEM
> cd ControlSet001\Services\BTHPORT\Parameters\Keys
> ls
Node has 1 subkeys and 0 values
  key name
  <xxxxxxxxxxxx>
> cd xxxxxxxxxxxx
> ls
Node has 1 subkeys and 4 values
  key name
  <d1350d003eee>
  size     type              value name             [value if type DWORD]
    16  3 REG_BINARY         <CentralIRK>
    16  3 REG_BINARY         <aaaaaaaaaaaa>
    16  3 REG_BINARY         <bbbbbbbbbbbb>
    16  3 REG_BINARY         <cccccccccccc>
> hex aaaaaaaaaaaa # For < Bluetooth 5.1 devices
> cd aaaaaaaaaaaa
> hex LTK
> hex ERand
> hex EDIV
> hex IRK
> cd ControlSet001\Services\BTHPORT\Parameters\Keys
```

Useful python snippets
```python
>>> LTK='<hex-of-LTK>'.replace(' ', '')
>>> ERand=int(''.join(list(reversed('<hex-of-ERand>'.strip().split()))), 16)
>>> EDIV=int(''.join(list(reversed('<hex-of-EDIV>'.strip().split()))), 16)
>>> IRK=list(reversed('<hex-of-IRK>'.strip().split()))
>>> print('LTK: ', LTK, '\n', 'ERand: ', ERand, '\n', 'EDIV: ', EDIV, '\n', 'IRK: ', ''.join(IRK))
```

## 8. Obsolete & Miscellaneous Tools

- **keepassxc-cli**: Generate 15-char secure password: `keepassxc-cli generate -L15 -lUns`
- **nohup**: Prevent process termination on session exit: `nohup bash run0.sh &`
- **Automatically Retrieve GitHub License (MIT)**:
  ```bash
  curl https://api.github.com/licenses/mit \
    | jq -r .body | sed -e "s/\[year\]/$(date +%Y)/" -e "s/\[fullname\]/$(
      getent passwd $USER | cut -d ':' -f 5)/" \
    > LICENSE
  ```
- **pwgen (Obsolete)**: Generate twenty 15-char passwords: `pwgen -cnys 12 20`
- **Iptables (Obsolete)**: *See raw documentation for complex u32 byte-shifting TCP Header match rules.*
- **Matlab Desktop File**: Set `MESA_LOADER_DRIVER_OVERRIDE=iris` and `_JAVA_AWT_WM_NONREPARENTING=1` inside `.desktop` Exec string.
- **Matlab**: `echo '-Djpgl.disable.openglarbcontext=1' > java.opts`

# Iptables IPSET u32 Byte-shifting TCP Header Match

Check whether the last value of TCP Seq in a network package equals 41: `0>>22&0x3C@ 4 &0xFF=0x29`

Example (Use Wireshark to catch packages), have this IP header:
```plaintext
Source IP: 121.41.89.52
= 01111001 00101001 01011001 00110100B = 79 29 59 34H = 2032752948D
IP Header：
45 00 00 3c 00 00 40 00 31 06 ef 34 **79 29 59 34** c0 a8 c7 81
TCP Header：
00 50 95 3c 8d 7f 52 ac 69 15 33 be a0 12 71 20 cd dc 00 00 02 04 05 14 04 02 08 0a 08 c8 62 fa 00 1c 30 a1 01 03 03 07
```
- `0`: Start from offset 0, get 4 bytes (since u32 means 32 bits). Here is `45 00 00 3c`.
- `>>22` shift right 22 bits. So `45 00 00 3c = 0100 0101 0000 0000 0000 0000 0011 1100` becomes `1 14 = 01 0001 0100`.
- `&0x3C` do bitwise AND with `0x3C` (like a filter).

Then
```plaintext
  01 0001 0100
& 00 0011 1100
--------------
  00 0001 0100
```
Conclusion, `0>>22&0x3C` get the 4&ndash;7 bits from the IP header.

So the length of this IP header is `01 0100 = 20D`.

`@` offset the pointer with the value on the left. So `0>>22&0x3C@` gets 20 bytes forward from the start address.

We want to know the TTL value of this TCP packet. So get value from TCP header at index of 4 and filter it using mask `0xFF` to get last 1 byte (8 bits).

Finally, compares to`0x29 = 41D`
> It can also compare to a range. e.g. Whether between 41-60: `0>>22&0x3C@ 4 &0xFF=0x29:0x3C`

## References

- [How to recursively chmod all directories except files?](https://superuser.com/a/91938)
- [2024-05-08 – Introducing BIND9 dnssec-policy](https://dotat.at/@/2024-05-08-dnssec-policy.html)
- [2024-05-11 – Migrating to BIND9 dnssec-policy](https://dotat.at/@/2024-05-11-dnssec-policy.html#risks-to-avoid)
