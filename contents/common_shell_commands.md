# Common Shell Commands

## Shell

### Shortcut

| Key | Description |
| --- | ----------- |
| `<C-b>` | Move back a char |
| `<C-f>` | Move forward a char |
| `<M-b>` | Move back a word |
| `<M-f>` | Move forward a word |
| `<C-s>` | Pause STDOUT |
| `<C-q>` | Resume STDOUT |
| `<C-r>` | Enter history search mode |
| `<C-g>` | Leave history search mode (Or break out a newline) |
| `<C-m>` | Same as `<CR>` (Enter key) |
| `<M-h>` | Open manual for current command |

- `type` Show command type (built-in or outer);
- `whereis` Show program path and its manual;
- `whatis` Show a program's manual.
- `help xxx` Fast help for shell built-in commands.
- `history` Show shell history, which can be used along with `fc`.

Redirects:
- Redirecting Output (Write, override) `>`
- Appending Redirected Output `>>`
- Here Strings `<<<`
- Here Documents
  ```shell-session
  $ cat <<[-]EOF
  111
  222
  333
  EOF
  ```

  The optional `-` trims the `<tab>`.
- Process Substitution
  ```shell-session
  $ cat <(echo 233)
  ```

Shell Variables
- `$#`: Number of arguments
- `$$` (same as `${$}`): Current shell's PID.
- `declare -i` defines integer variable
  ```shell-session
  $ x=5; y=3
  $ declare -i z=$x+$y
  $ z=z+3 # Integer variable can do arithmetic directly
  $ k=$(($x+$y)) # Do arithmetic but the type of 'k' still remains string
  ```
- Shell for loop
  ```bash
  #!/bin/sh
  for ((i=0; i<=10; i=i+1)); do
    printf " $i"
  done
  printf "\n"
  for i in {0..10}; do
    printf " $i"
  done
  printf "\n"
  for i in {0..10..2}; do # Step = 2
    printf " $i"
  done
  printf "\n"
  # Results:
  #  0 1 2 3 4 5 6 7 8 9 10
  #  0 1 2 3 4 5 6 7 8 9 10
  #  0 2 4 6 8 10
  ```
- Shell's Functions
  ```bash
  #!/bin/sh
  function sum() {
     echo $# # 
     echo $* # Parameters in string type
     echo $0 # The 0st parameter, which is the name of executed file itself
     echo $1 # The first parameter
     echo $@ # Parameters in an array type
  }
  sum 1 2 7 'a'
  # Results:
  # 4
  # 1 2 7 a
  # ./sum.sh
  # 1
  # 1 2 7 a
  ```
- How do shell arguments be processed with `stdin`, `stdout`, `stderr`:
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
  ```shell-session
  clang test.c -o test
  ./test 1 2 3 a b c <<EOF
  hello world
  aaaaaaa
  EOF
  ```

## Glob Extension

Exclusive Delete
- Bash
  ```shell-session
  $ shopt -s extglob
  $ rm -r !(file1|file2|dir)
  ```
- Zsh
  ```shell-session
   $ setopt extendedglob
   $ rm -r ^(file1|file2|dir)
   ```

### Trap

Reset signal `TERM`'s action to the default: `trap - TERM`

| Signal Number | Signal Name | Default Action |
| ------------- | ----------- | -------------- |
| 0  | EXIT | Nothing                                                    |
| 2  | INT  | Terminate (Interrupt, weakest, Ctrl+C)                     |
| 15 | TERM | Terminate (Exit cleanly, normal)                           |
| 1  | HUP  | Terminate (Hangup, normal, sent from SSH disconnect)       |
| 3  | QUIT | Terminate (Harshest but still handle ignorable, core dump) |
| 9  | KILL | Terminate (Unconditionally)                                |

### IF Statement in Bash

- Integer Operator
  ```plaintext
  -eq    equal
  -ne    not equal
  -gt    greater
  -ge    geeater or equal
  -lt    lesser
  -le    lesser or equal
  ```
- File Operator
  ```plaintext
  -e          File or directory exist
  -r          Readable
  -w          Writable
  -x          Executable
  -f          Whether a normal file
  -d "dir"    Whether a directory exists
  ! -d "dir"  Whether a directioy not exists
  -c          Whether a char file
  -b          Whether a block file
  -s          Ture if file size is not zero
  -t          Whether a tty file
  ```
- String Operator
  ```plaintext
  # POSIX sh
  str1 = str2
  str1 > str2    Compare by alphabetical order
  str1 < str2
  -z str         True if the string length is zero
  -n str         True if the string length is non-zero
  # Bash specific (Can use pattern matching '[[' ']]')
  str1 == str2
  str1 != str2
  str1 =~ regex  Extended regular expression
  ```
- Logical Operator
  ```plaintext
  -a        And
  -o        Or
  !         Not
  [] && []  And (For pattern matching use '[[' ']]')
  [] || []  Or
  ```

### Bash Extended Globbing

| Glob         | Regular Expression Equivalent |
| ------------ | ----------------------------- |
| `*`          | `.*`                          |
| `?`          | `.`                           |
| `[a-z]`      | SAME                          |
| `?(pattern)` | `(regex)?`                    |
| `*(pattern)` | `(regex)*`                    |
| `+(pattern)` | `(regex)+`                    |
| `@(pattern)` | `(regex){1}`                  |
| `!(pattern)` | `^((?!regex).)*$`             |

#### Variable Parameter Expansions

| Key | Description |
| --- | ----------- |
| `::n` | Cut `n` chars from left to right if `n` is positive, otherwise right to left if negative |
| `:n`| Cut to end start from column `n`, if `n` is negative then right to left (use `:(-n)` or `: -n`) |
| `:x:y`| Cut `y` chars start from column `x` |
| `${food:-Cake}` | Defaults to `Cake` if `$food` does not exist |

| `STR="/path/to/foo.cpp"` | Description |
| ------------------------ | ----------- |
| `echo ${STR%/*} # /path/to` | Cut from right to left, single `%` means non-greedy |
| `echo ${STR#*/} # path/to/foo.cpp` | Cut from left to right, single `#` means non-greedy |
| `echo ${STR%.cpp} # /path/to/foo` | Two `%` is greedy |
| `echo ${STR##*.}  # cpp` | Two `#` is greedy |
| `echo ${STR/foo/bar} # /path/to/bar.cpp` | String substitution, single `/` means non-greedy |
| `echo ${STR//o/b} # /path/tb/fbb.cpp` | Two `/` is greedy |

### set

`set -eufo pipefail`
- `-e` let bash exit immediately if any command has non-zero exit status.
- `-u` let bash exit immediately if there are any reference to variable haven't defined yet.
- `-f` disables pathname expansion (globbing).
- `-o pipefail` prevents error in pipeline from being masked. Any command fails in pipeline will keep its return code for whole pipeline.

## Reset User Fail Lock

```shell-session
$ faillock --user <username> --reset
```

## Binary File Editing Modification

Generate a hex dump:
```shell-session
$ xxd TIAS2781RCA4.bin > TIAS2781RCA4.bin.txt
```

Revert plaintext hex dump back into binary:
```shell-session
$ cat TIAS2781RCA4.bin.txt | xxd -r > TIAS2781RCA4_mod.bin
```

## PDF Editing

PDF Extracting:
```shell-session
$ pdfimages -all in.pdf out_dir/
```

PDF Regenerate:
```shell-session
$ img2pdf --output out.pdf \
--creator 'Canon SC1011' \
--producer 'IJ Scan Utility' \
--creationdate 'Wed Mar 20 16:33:38 2024 CST' \
-D \
--engine internal \
-s 600dpi \
[1-5].jpg
$ pdfinfo out.pdf
```

## Gamescope

Launch a game with FSR1, VRR, MangoHud in Steam:
```shell-session
$ gamescope -w 1728 -h 1080 -W 2944 -H 1840 --adaptive-sync -F fsr --fsr-sharpness 10 -- env LD_PRELOAD='/usr/lib/mangohud/libMangoApp.so /usr/lib/mangohud/libMangoHud.so /usr/lib/mangohud/libMangoHud_dlsym.so /usr/lib/mangohud/libMangoHud_opengl.so' sh ./cream.sh %command%
```

## OpenLDAP Search

Use the Manager permission to query:
```shell-session
$ ldapsearch -x -D'cn=Manager,dc=tailba6c3f,dc=ts,dc=net' -W -b'ou=People,dc=tailba6c3f,dc=ts,dc=net' '(objectClass=*)' | less
```

## Libvirt

> Run `--print-xml | less` to dump `.xml` for debugging.

- Install an Arm Cortex-A53 machine
  ```shell-session
  $ virt-install --connect qemu:///system \
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
- Install a RISC-V machine
  ```shell-session
  $ virt-install --connect qemu:///system \
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

## OpenSSL Self signing

Generate CA certificate & private key:
```shell-session
$ openssl req -noenc \
-newkey EC -pkeyopt ec_paramgen_curve:P-384 -keyout ca.key.pem \
-x509 -new -sha384 -days 730 \
-subj '/C=JP/ST=Toukyouto/L=Setagayaku Kitazawa/O=Homo114514/OU=Yajuu Sa-ba-/CN=Homo home/emailAddress=sudaku233@outlook.com' \
-out ca.pem
```

Generate certificate signing request (CSR) & private key (optional, can reuse CA key):
```shell-session
$ openssl req -noenc \
-newkey EC -pkeyopt ec_paramgen_curve:P-384 -keyout server.key.pem \
-new -sha384 \
-subj '/C=JP/ST=Toukyouto/L=Setagayaku Kitazawa/O=Homo114514/OU=Yajuu Sa-ba-/CN=*.tailba6c3f.ts.net/emailAddress=sudaku233@outlook.com' \
-out server.csr.pem
```

Generate certificate by signing CSR with a CA certificate:
```shell-session
$ openssl x509 -CA ca.pem -CAkey ca.key.pem -CAcreateserial \
-days 730 -sha384 \
-extfile <(<<EOF
subjectAltName = DNS:localhost,DNS:*.tailba6c3f.ts.net
authorityKeyIdentifier = keyid,issuer
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage=serverAuth
EOF
) \
-req -in server.csr.pem -out server.pem
```

> `-CAcreateserial` will generate `ca.srl`, afterward using `-CAserial ca.srl`.

Show information:
```shell-session
$ openssl ec -text -noout -in server.key.pem
$ openssl req -text -verify -in server.csr.pem
$ openssl x509 -noout -text -in server.pem
```

## gawk

Filter only the column 3 with value >= 90: `awk '$3 >= 90 { print }'`, where `$3 >= 90` is pattern (Optional), `print` is the action.

- `$0`: Whole line.
- `NR`: Current line number. e.g. To ignore the first line `awk 'NR > 1 { print $2, $5 }'`
- `BEGIN` means the start of file; `END` means end of file. e.g. `awk 'BEGIN { print "SOF" } { print } END { print "EOF" }'`
- AWK supports variables:

  e.g. Calculate sum `awk 'BEGIN { sum = 0 } { sum = sum + $3 } END { avg = sum / NR; print NR, sum, avg }'`
  
  e.g. Char count `awk '{ cc = cc + length($0) + 1 } END { print NR, wc }'` (Validate by `wc -ml`. The extra +1 is because there is `\n` at each end of line)
- `NF`: Word count of the current line.
  e.g. `awk '{ cc = cc + length($0) + 1; wc = wc + NF } END {print NR, cc, wc }'` (To validate, run `wc`)
- `-F` set the delimiter `awk -F':'`

## grep

Find in files recursively:
```shell-session
$ grep -iRl "your-text-to-find" ./
```

- `-o`, `--only-matching` Print only the matched parts;
- `-n` Show line number;
- `-v` Reverse match;
- `-i` Case-insensitive;
- `-r` Search directories recursively.

## Ripgrep

```shell-session
$ rg --no-ignore -. -L -g \!node_modules -g \!_book -g \!yarn.lock -g \!.git "awk" ./
```

Arguments explanation:
- `-.`, `--hidden` Search hidden files and directories.
- `-L`, `--follow` Follow symbolic links.
- `--no-ignore` Ignore files such as `.gitignore` will not be respected.

## Sort
  
Sort the third column of `scores.txt`: `sort -n -k 3 scores.txt | less`

- `-n` `sort` defaults to ASCII code sort, use `-n` for numeric sort.
- `-r` Reverse sort.
- `-u` Remove duplicates. The difference to `uniq` is that `uniq` removes exactly same content line, while `sort -u` remove lines which has the same match.

## Coreutils

### tr
  
`tr` can convert the content to UPPERCASE/Lowercase. e.g. `tr 'a-z' 'A-Z'` (equivalent to `tr '[:lower:]' '[:upper:]'`)

## nohup

`nohup` prevents program to hang on session terminate.

e.g. `nohup bash run0.sh &`

## Findutils

### Xargs

`xargs` format the stdin as parameters to the command.

e.g. Calculate numbers and the symbol '-' in a pile of files `find . -name '*[0-9][0-9][0-9]*.txt' | xargs egrep -o '^[0-9-]+' | wc -l`.

## Diff

Format explanation:
Three actions: `d(elete)`, `c(hange)`, `a(dd)`.

e.g. `130d129` delete line 130, then align to line 129; `249a130,131` add lines 130 and 131 to former's line 249; `271,373c163,271` replace line 163, 271 to former's line 271, 373.

### `dd`

Backup GPT:
```shell-session
# dd if=/dev/sda of=gpt-partition.bin bs=512 count=34
```

Restore GPT
```shell-session
# dd if=gpt-partition.bin of=/dev/sda bs=512 count=34
```

## DSDT (Differentiated System Description Table)

Here is an example to fix the s2idle issue on Lenovo Yoga Air 14s APU8 (aka. Yoga Slim 7 Gen 8 14APU8)

### Extract & Modify DSDT

Extract the binary ACPI tables
```shell-session
# cat /sys/firmware/acpi/tables/DSDT > dsdt.dat
```
Disassemble the ACPI tables to a `.dsl` file
```shell-session
$ iasl -d dsdt.dat
```
Modify DSDT
```shell-session
$ vim dsdt.dsl
```
Attempt to create a hexed AML table (in C) `dsdt.aml`
```shell-session
$ iasl -tc dsdt.dsl | grep Errors
```

### Extract & Modify SSDT (System Service Descriptor Table)

Extract SSDT
```shell-session
# for i in /sys/firmware/acpi/tables/SSDT*; do \
    cat $i > ${i##*/}; \
done
$ iasl -d SSDT*
```
Modify SSDT
```shell-session
$ rg "SB.PCI0.GPP8.NVME" SSDT*.dsl
$ # Found keywords in SSDT14.dsl, comment out it
$ vim SSDT14.dsl
```
Compile SSDT (generate `.aml`)
```shell-session
$ iasl -tc SSDT14.dsl
```
Create a `cpio` archive
```shell-session
$ mkdir -p kernel/firmware/acpi
$ cp dsdt.aml SSDT14.aml kernel/firmware/acpi # dsdt.aml is optional if it keep untouched
$ find ./kernel | cpio -o -H newc > SSDT14
```

> To extract a `cpio` archive
> ```shell-session
> $ cpio -iv -H newc < SSDT14
> $ iasl -d kernel/firmware/acpi/SSDT14.aml
> ```

> `cpio` arguments explanation:
> - `-o`, `--create`: Copy-out;
> - `-H`, `--format=FORMAT`: Use given archive **FORMAT**. `newc` is the new (SVR4) portable format;
> - `-i`, `--extract`: Copy-in;
> - `-v`, `--verbose`: Verbosely list the files processed.

## Filesystem

- A file corresponds to one inode (which stores the file properties and the pointer table of blocks, blocks store the data of the file).
- Hard symbol links: Same file but has multiple names; Only apply to file, doesn't support directory; Can't across filesystems.
-  Soft symbol links (aka. Symlink): Different file but same name; Could apply to file or directory; Can across filesystems.
- Why directories cannot have hard link, but it has hard link count more than 1? Because directories have pointer `./` and `../`, which increase the hard link count.

## Misc

- `findmnt`: List all mounted filesystems.
- List options that are set for a loaded module
  ```shell-session
  # systool -v -m module_name
  ```

## Clean Build

- Prepare
  ```shell-session
  $ RAMDISK_SIZE=$(($(free -m | awk '/Mem/ { print $7 }')/2))
  $ sudo mount --mkdir -t tmpfs -o defaults,size=${RAMDISK_SIZE}M tmpfs \
  /tmp/aur_chroot
  $ sudo dd if=/dev/zero of=/tmp/aur_chroot/ramdisk status=progress bs=1M \
  count=$RAMDISK_SIZE
  $ sudo mkfs.btrfs -m single -f /tmp/aur_chroot/ramdisk
  $ sudo mount --mkdir -t btrfs -o loop,sync,compress=zstd \
  /tmp/aur_chroot/ramdisk /tmp/aur_chroot/overlay
  $ sudo chown proteus: /tmp/aur_chroot/overlay
  $ CHROOT=/tmp/aur_chroot/overlay
  ```
- Use `paru`
  ```shell-session
  $ paru -S --chroot=$CHROOT <Packages>
  ```
- Manual Way
  ```shell-session
  # mkarchroot $CHROOT/root base-devel
  $ makechrootpkg -c -r $CHROOT [-I ../Build_Deps/Build_Deps.pkg.tar.zst]
  ```
- Unmount
  ```shell-session
  # umount $CHROOT /mnt/chroots/tmp
  ```

### Sed

The usage of group in regular expression:

Exchange the first column and second column
```shell-session
$ sed -r 's/^([0-9]*)([\t ]*)([^\t ]*)/\3\2\1/' data.txt
```

> Note: The numbering of the groups depend on the appear order of the left parentheses `(`:
> ```plaintext
> (( )( )( ))
> 12  3  4
> ```

Delete the line start by `std`: `sed -r '/^std/d' main.txt`

## Rsync

1. Copy and preserve all attributes
   ```shell-session
   $ rsync -aP $SOURCE_DIR/ $TARGET_DIR/`
   ```
2. Copy only, don't keep permission and owner (keep only touch times)
   ```shell-session
   $ rsync -rltP --no-owner --no-group --no-perms $SOURCE_DIR/ $TARGET_DIR/
   ```
3. Synchronize folders remotely, 
   ```shell-session
   $ rsync -azP -zc=zstd --exclude={"filename1","path/to/filename2"} \
   --delete $SOURCE_DIR/ $TARGET_DIR/
   ```

Arguments explanation:
- `-a`, `--archive`: Equivalent to `-rlptgoD`. It's a quick way of saying you want recursion and want to preserve almost everything.
- `-r`, `--recursive`: Copy directories recursively.
- `-l`, `--links`: Add symlinks to the transferred files instead of noisily ignoring them with a "non-regular file" warning for each symlink encountered.
- `-p`, `--perms`: Preserve permissions.
- `-t`, `--times`: Preserve modification times.
- `-g`, `--group`: Preserve group.
- `-o`, `--owner`: Preserve owner (super-user only).
- `-D`: Same as `--devices --specials`.
- `--devices`: Transfer character and block device files to the remote system to recreate these devices (Super-user only).
- `--specials`: Transfer special files, such as named sockets and fifos.
- `-P`: Same as `--partial --progress`.
- `--partial`: Keep partially transferred files. By default, rsync will delete any partially transferred file if the transfer is interrupted.
- `--progress`: Show progress during transfer.
- `-z`, `--compress`: Compress file data during the transfer.
- `-zc=STR`, `--compress-choice=STR`: Choose the compression algorithm
- `--delete`: Delete extraneous files from destination directories.
  
## Iproute2

### ss

Another utility to investigate sockets

List sockets statistics: `ss -s`

See which process was using specific UDP port:
```shell-session
# ss -lnptu | grep $PORT_NUMBER
```

Arguments explanation:
- `-l`, `--listening`: Display only listening sockets (these are omitted by default).
- `-n`, `--numeric`: Do not try to resolve service names.
- `-p`, `--processes`: Show process using socket.
- `-t`, `--tcp`: Display TCP sockets
- `-u`, `--udp`: Display UDP sockets.

## `chmod` directories only (exclude files)

Recursively give directories read & execute privileges:
```shell-session
# find /path/to/dir -type d -exec chmod 755 {} \+
```

Recursively give files read privileges:
```shell-session
# find /path/to/dir -type f -exec chmod 644 {} \+
```

## Bluetooth Dual Boot Pairing

Extracting on Linux

```shell-session
# cryptsetup open --type=bitlk /dev/nvme0n1p3 win11 <<<XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX
# mount -t ntfs3 /dev/mapper/win11 /mnt/win11
$ cd /mnt/win11/Windows/System32/config
# chntpw -e SYSTEM
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
> cd aaaaaaaaaaaa # For Bluetooth 5.1 devices
> hex LTK
> hex ERand
> hex EDIV
> hex IRK
```

Useful python snippets
```python
>>> LTK='<hex-of-LTK>'.replace(' ', '')
>>> ERand=int(''.join(list(reversed('<hex-of-ERand>'.strip().split()))), 16)
>>> EDIV=int(''.join(list(reversed('<hex-of-EDIV>'.strip().split()))), 16)
>>> IRK=list(reversed('<hex-of-IRK>'.strip().split()))
>>> print('LTK: ', LTK, '\n', 'ERand: ', ERand, '\n', 'EDIV: ', EDIV, '\n', 'IRK: ', ''.join(IRK))
```

### Kernel interface

UUID Generator (Or `uuidgen`):
```shell-session
$ cat /proc/sys/kernel/random/uuid
```

Show battery capacity remain:
```shell-session
$ cat /sys/class/power_supply/<Your battery name>/capacity
```

List network interfaces:
```shell-session
$ ls /sys/class/net # Or
$ ip link
```

List monitor modes from kernel DRM module
```shell-session
$ cat /sys/class/drm/card1/card1-eDP-1/modes
```

Show current module's parameters:
```shell-session
# cat /sys/module/nvidia_drm/parameters/modeset
```

Inform the OS of partition table changes
```shell-session
# partprobe
```

## D-Bus

Manually inhibit / pause `clight`<sup>[AUR](https://aur.archlinux.org/packages/clight)</sup>.

Show all properties:
```shell-session
$ busctl --user introspect org.clight.clight /org/clight/clight org.clight.clight
```

Call method `Inhibit`:
```shell-session
$ busctl --user call org.clight.clight /org/clight/clight org.clight/clight Inhibit b true
```

Check property `Inhibited`:
```shell-session
$ busctl --user get-property org.clight.clight /org/clight/clight org.clight.clight Inhibited
```

Call method `Pause`:
```shell-session
$ busctl --user call org.clight.clight /org/clight/clight org.clight.clight Pause b true
```

Check property `Suspended`:
```shell-session
$ busctl --user get-property org.clight.clight /org/clight/clight org.clight.clight Suspended
```

## SSH

Stop a remote control connection:
```shell-session
$ ssh -O stop proteus@proteusdesktop
```

### ssh-keygen

Show the fingerprint of a keyfile:
```shell-session
$ ssh-keygen -l -f </path/to/key>
$ ssh-keygen -l -E md5 -f </path/to/key>
```

Modify the comment of a keyfile:
 ```shell-session
 $ ssh-keygen -c -C <Your comment> -f </path/to/key>
 ```
Show the information of a keyfile:
```shell-session
$ ssh-keygen -y -f <Your key>
```

Regenerate host keys:
```shell-session
# rm /etc/ssh/ssh_host_*
# ssh-keygen -A
```

## SSH Tunnel

X11vnc startup with SDDM and SSH Tunnel:
```shell-session
ssh -t -L 5900:localhost:5900 <REMOTE HOST> 'sudo x11vnc -localhost -display :0 -auth $(find /var/run/sddm/ -type f)'
```

## GPU Environment Variables

```shell-session
# /usr/share/glvnd/egl_vendor.d/*
__EGL_VENDOR_LIBRARY_FILENAMES='/usr/share/glvnd/egl_vendor.d/10_nvidia.json'
__GLX_VENDOR_LIBRARY_NAME=nvidia
# /usr/share/vulkan/icd.d/*
VK_ICD_FILENAMES='/usr/share/vulkan/icd.d/nvidia_icd.json'

# lspci -D | grep VGA
DRI_PRIME=pci-0000_06_00_0 glxinfo | grep 'OpenGL renderer'

# /usr/lib/dri/*_dri.so
MESA_LOADER_DRIVER_OVERRIDE=iris

# /usr/lib/dri/*_drv_video.so
LIBVA_DRIVER_NAME=

LIBVA_DRIVER_NAME=radeonsi vainfo --display drm --device /
```

## `certbot`

Register a wildcard domain hosted on Cloudflare
```shell-session
# certbot certonly --dns-cloudflare --dns-cloudflare-credentials \
~/.secrets/cloudflare.ini \
--server https://acme-v02.api.letsencrypt.org/directory \
--email <EMAIL> --agree-tos --no-eff-email -d '*.proteus.net'
```

## Adjust brightness of a monitor supports DDC

```shell-session
ddcutil -l C340SCA getvcp 10
ddcutil -l C340SCA setvcp 10 - 5
```

## GnuPG

Issue: *"There is no assurance this key belongs to the named user"*
Solution: Set the trust level of the keys:
```shell-session
gpg --edit-key
gpg> trust
Your decision? 5
gpg> quit
```

## Git

Show pretty commit history
```shell-session
git -P log \
--pretty='format:%C(auto)%G?%d %h %an %ar %s' \
--graph --all --color=always | less
```

## BIND

### rndc

Generate a key
```shell-session
$ tsig-keygen -a hmac-sha384 custom
key "custom" {
  algorithm hmac-sha384;
  secret "oGJ8/z7ynKx2nzEf7DQxnBypbsIDivrp4qzcUT9EkEE=";
};
```

```shell-session
rndc reconfig
rndc status
rndc dnssec -status tailba6c3f.ts.net
```

### DNSSEC

The new `dnssec-policy` let the keys under `named`s control. In principle the keys become more like dynamic zone data than static configuration.

Get DS record from the key
```shell-session
$ dnssec-dsfromkey Ktailba6c3f.ts.net.+015+50543.key
tailba6c3f.ts.net. IN DS 50543 15 2 80F61B4AF40FCFF8A61852F5479C299BD31676F5F65765AE3AEDA08C9B3C78A0
```
In this example, 15 represents ED25519, and 2 represents the digest type SHA-256, the key ID is 50543.

Print key's metadata:
```shell-session
$ dnssec-settime -p all Ktailba6c3f.ts.net.+015+50543
```

The CDS and CDNSKEY are identical to the DS and DNSKEY records, but they automate the process to pass the records to the parent zone.

## yt-dlp

List all available formats for a video:
```shell-session
$ yt-dlp --cookies-from-browser firefox -F 'https://www.youtube.com/watch?v=S5bfdUTrKLM&t=3s'
```

Download with specific format code
```shell-session
$ yt-dlp --cookies-from-browser firefox -f 'bestvideo*+bestaudio/best'
```

- `-f`, `--format` Use `-f -` for interactive selector (implies `-F`);
- `-F`, `--list-formats` List available formats of each video;
- `--audio-multistreams` Allow multiple audio streams to be merged into a single file;
- `--video-multistreams` Allow multiple video streams to be merged into a single file.

> Format Selection:
> - `b*`, `best*`: Select the best quality format that **contains either** a video or an audio or both (i.e.; `vcodec!=none` or `acodec!=none`). 
> - `b`, `best`: Select the best quality format that **contains both** video and audio. Equivalent to `best*[vcodec!=none][acodec!=none]`.
> - `/`: Or logic.

## mdadm FakeRAID

Erase the metadata:
```shell-session
# mdadm --zero-superblock /dev/nvme0n1p2
```

Stop the array:
```shell-session
# mdadm --stop /dev/md127
```

## nvmecli

Get LBA format:
```shell-session
# sudo nvme id-ns /dev/nvme0n1 -H | grep 'LBA Format'
```
> Warning: Most SSDs use a 4096 byte physical sector size, even though some report 512.

## keepassxc-cli

Generate a password that has 14 length, upper and lowercases, numeric, specials:
```shell-session
keepassxc-cli generate -L14 -lUns
```

## Obsoleted

### `pwgen`

Random password generator

e.g. Generate 20 different passwords which has length 12 and at least one big letter (`-c`), number (`-n`), symbol (`-y`). Furthermore, `-s` can generate more randomize passwords
```shell-session
$ pwgen -cnys 12 20
```

### Iptables

1. IPSET u32 match
  Check whether the last value of TCP Seq in a network package equals 41 : `0>>22&0x3C@ 4 &0xFF=0x29`
  Example (Use Wireshark to catch packages), have this IP header:
  ```
  Source IP: 121.41.89.52
  = 01111001 00101001 01011001 00110100B = 79 29 59 34H = 2032752948D
  IP Header：
  45 00 00 3c 00 00 40 00 31 06 ef 34 **79 29 59 34** c0 a8 c7 81
  TCP Header：
  00 50 95 3c 8d 7f 52 ac 69 15 33 be a0 12 71 20 cd dc 00 00 02 04 05 14 04 02 08 0a 08 c8 62 fa 00 1c 30 a1 01 03 03 07
  ```
  `0`: Start from offset 0, get 4 bytes (since u32 means 32 bits). Here is `45 00 00 3c`.
  `>>22` shift right 22 bits. So `45 00 00 3c = 0100 0101 0000 0000 0000 0000 0011 1100` becomes `1 14 = 01 0001 0100`.
  `&0x3C` do bitwise AND with `0x3C` (like a filter). Then
  ```
    01 0001 0100
  & 00 0011 1100
  --------------
    00 0001 0100
  ````
  Conclusion, `0>>22&0x3C` get the 4&ndash;7 bits from the IP header.

  So the length of this IP header is `01 0100 = 20D`.

   `@` offset the pointer with the value on the left. So `0>>22&0x3C@` gets 20 bytes forward from the start address.
  We want to know the TTL value of this TCP packet. So get value from TCP header at index of 4 and filter it using mask `0xFF` to get last 1 byte (8 bits).
   Finally, compares to`0x29 = 41D`
   > It can also compare to a range. e.g. Whether between 41-60: `0>>22&0x3C@ 4 &0xFF=0x29:0x3C`

### Matlab

```ini
# matlab.desktop
Name=Matlab2022b
Comment=A high-level language for numerical computation and visualization
GenericName=Matlab
Exec=env _JAVA_AWT_WM_NONREPARENTING=1 LD_PRELOAD=/usr/lib/libstdc++.so LD_LIBRARY_PATH=/usr/lib/xorg/modules/drivers/ MESA_LOADER_DRIVER_OVERRIDE=iris /home/proteus/MATLAB/R2022b/bin/matlab -desktop
Categories=Education
Type=Application
```

```plaintext
// java.opts
-Djpgl.disable.openglarbcontext=1
```

## References

- [How to recursively chmod all directories except files?](https://superuser.com/a/91938)
- [2024-05-08 – Introducing BIND9 dnssec-policy](https://dotat.at/@/2024-05-08-dnssec-policy.html)
- [2024-05-11 – Migrating to BIND9 dnssec-policy](https://dotat.at/@/2024-05-11-dnssec-policy.html#risks-to-avoid)
