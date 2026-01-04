# Libvirt

- Open a virsh shell (system session)
  ```bash
  virsh -c qemu:///system
  ```
- List virtual machines
  ```bash
  list --all
  ```
- Edit a VM
  ```bash
  edit --domain win11
  ```
- Force power-off a VM
  ```bash
  destroy --domain win11
  reset --domain win11 # Or reset
  ```

## Networking

Enable and start the default network:
```bash
virsh net-autostart default
virsh net-start default
```

## Passthrough a USB device

```xml
<hostdev mode='subsystem' type='usb' managed='yes'>
  <source>
    <vendor id='0x152d'/>
    <product id='0xa583'/>
  </source>
</hostdev>
```

## TPM Support

To enable Trusted Platform Module (TPM) Support in your KVM, install the `swtpm` package:
```bash
sudo pacman -S swtpm
```
This package provides a software-based TPM emulator for virtual machines.

## Btrfs Filesystem Optimization

If you store KVM images on a Btrfs filesystem, disable copy-on-write (CoW) to prevent potential corruption of virtual machine images. Use the `chattr` command to set the `nocow` attribute:
```bash
sudo chattr +C /var/lib/libvirt/images
```
Apply this setting to the directory before creating disk images to ensure data integrity.

## GVT-g Configuration with i915ovmfPkg

The `i915ovmfPkg` VBIOS is used to enable DMA-BUF display for UEFI-based guests with Intel GVT-g. As noted in the ArchWiki's Intel GVT-g page, standard OVMF does not create the necessary ACPI OpRegion, causing UEFI guests to fail to display output until the guest OS's GPU driver is loaded. The `i915ovmfPkg` provides a custom VBIOS ROM (`i915ovmf.rom`) that resolves this issue, ensuring proper display output from boot without requiring kernel or OVMF patches.[^1]

Note that the following QEMU parameters are **no longer supported** with `i915ovmfPkg`:
```xml
<!-- Display everything that happens before the guest Intel driver is loaded -->
<qemu:arg value='-set'/>
<qemu:arg value='device.hostdev0.ramfb=on'/>
<qemu:arg value='-set'/>
<qemu:arg value='device.hostdev0.driver=vfio-pci-nohotplug'/>
```

To achieve a smoother graphical experience with QEMU, configure the GTK display with OpenGL enabled:
```xml
<domain type='kvm' xmlns:qemu='http://libvirt.org/schemas/domain/qemu/1.0'>
  <qemu:commandline>
    <qemu:arg value='-display'/>
    <qemu:arg value='gtk,gl=on'/>
    <qemu:env name='DISPLAY' value=':0'/>
    <qemu:env name='MESA_LOADER_DRIVER_OVERRIDE' value='iris'/>
  </qemu:commandline>
  <qemu:override>
    <qemu:device alias='hostdev0'>
      <qemu:frontend>
        <qemu:property name='display' type='string' value='on'/>
        <qemu:property name='romfile' type='string' value='/i915ovmf.rom'/><!-- Specify the custom ROM's location -->
        <qemu:property name='x-igd-opregion' type='bool' value='true'/><!-- Enable the IGD OpRegion -->
      </qemu:frontend>
    </qemu:device>
  </qemu:override>
</domain>
```

## Hugepages Configuration

To optimize memory performance for your virtual machine, configure hugepages. Calculate the number of hugepages required using the formula:
```bash
$ echo "scale=2;<VM Memory size in GiB>*1024^2/$(grep Hugepagesize /proc/meminfo | awk '{print $2}')+1180" | bc
```
For example, for an 8 GIB VM with a 2 MiB hugepage size (2048 KiB), the calculation yields approximately `5276` hugepages (`4096` for the VM + `1180` for overhead that already exists)

Set the number of hugepages in `/etc/sysctl.d/40-hugepage.conf`:
```properties 
vm.nr_hugepages=5276
```

Apply the changes:
```bash
sudo sysctl -p /etc/sysctl.d/40-hugepage.conf
```

## Hypervisor XML Configuration

Below is an optimized KVM domain XML configuration for a virtual machine with 8 GiB of memory, Secure Boot, and CPU passthrough:
```xml
<domain type='kvm' xmlns:qemu='http://libvirt.org/schemas/domain/qemu/1.0'>
  <memory unit='KIB'>8388608</memory>
  <memoryBacking>
    <hugepages/>
  </memoryBacking>
  <os>
    <!-- Secure Boot -->
    <loader readonly='yes' secure='yes' type='pflash'>/usr/share/edk2/x64/OVMF_CODE.secboot.4m.fd</loader>
  </os>
  <iothreads>1</iothreads>
  <vcpu placement='static'>8</vcpu>
  <cputune>
    <!-- Use `lscpu -e` to see CPU topology. Here I pinned CPU2,3,4,5 to hypervisor, CPU1 to emulator and iothread -->
    <vcpupin vcpu='0' cpuset='2'/>
    <vcpupin vcpu='1' cpuset='10'/>
    <vcpupin vcpu='2' cpuset='3'/>
    <vcpupin vcpu='3' cpuset='11'/>
    <vcpupin vcpu='4' cpuset='4'/>
    <vcpupin vcpu='5' cpuset='12'/>
    <vcpupin vcpu='6' cpuset='5'/>
    <vcpupin vcpu='7' cpuset='13'/>
    <emulatorpin cpuset='1,9'/>
    <iothreadpin iothread='1' cpuset='1,9'/>
  </cputune>
  <cpu mode='host-passthrough' check='none' migratable='off'>
    <topology sockets='1' dies='1' cores='4' threads='2'/>
    <cache mode='passthrough'/>
    <numa>
      <cell memory='memory size of virtual machine' unit='KiB' memAccess='shared'/>
    </numa>
  </cpu>
  <features>
    <hyperv mode='custom'>
      <relaxed state='on'/>
      <vapic state='on'/>
      <spinlocks state='on' retries='8191'/>
      <vpindex state='on'/>
      <runtime state='on'/>
      <synic state='on'/>
      <!-- Note: Enable stimer may prevent Windows 10 from booting on i7-8750H -->
      <stimer state='on'>
        <direct state='on'/>
      </stimer>
      <reset state='on'/>
      <vendor_id state='on' value='GenuineIntel'/><!-- For Intel -->
      <!-- vendor_id state='on' value='AuthenticAMD'/> --><!-- For AMD -->
      <frequencies state='on'/>
      <reenlightenment state='on'/>
      <tlbflush state='on'>
        <direct state='on'/>
        <extended state='on'/>
      </tlbflush>
      <ipi state='on'/>
      <evmcs state='on'/>
      <avic state='on'/>
      <emsr_bitmap state='on'/>
      <xmm_input state='on'/>
    </hyperv>
    <smm state='on'/><!-- Secure Boot -->
  </features>
  <clock offset='localtime'>
    <timer name='rtc' tickpolicy='catchup' track='guest'/>
    <timer name='pit' tickpolicy='delay'/>
    <timer name='hpet' present='no'/>
    <timer name='kvmclock' present='no'/>
    <timer name='hypervclock' present='yes'/>
    <timer name='tsc' present='yes' mode='native'/>
  </clock>
  <devices>
     <!-- Through the VirtIO mouse and keyboard being added, the PS2 devices cannot be removed as they are internal
    function of the emulated Q35/440FX chipsets -->
    <input type='mouse' bus='virtio'/>
    <input type='keyboard' bus='virtio'/>
    <disk type='file' device='disk'>
      <driver name='qemu' type='qcow2' cache='none' io='native' discard='unmap' iothread='1' queues='8'/>
      <source file='/var/lib/libvirt/images/win11.qcow2'/>
      <target dev='vda' bus='virtio'/>
    </disk>
    <!-- Enable a shared directory between the host and guest using `virtiofs` -->
    <filesystem type='mount' accessmode='passthrough'>
      <driver type='virtiofs'/>
      <source dir='/mnt/storage2/virt_share_dir'/>
      <target dir='mount_tag'/>
    </filesystem>
    <interface type='direct'>
      <mac address='11:45:14:19:19:81'/>
      <source dev='macvtap0' mode='vepa'/>
      <model type='virtio'/>
    </interface>
    <rng model='virtio'>
      <backend model='random'>/dev/random</backend>
    </rng>
    <panic model='hyperv'/>
  </devices>
</domain>
```

> Use `cpu.numa.cell` if you have multi-sockets motherboard, otherwise you can just add
> ```xml
> <memoryBacking>
>   <source type='memfd'/>
>   <access mode='shared'/>
> </memoryBacking>
> ```

## virt-install

```bash
sudo virt-install \
  --name win11 \
  --memory 8192 \
  --memorybacking hugepages=yes,source.type=memfd,access.mode=shared \
  --iothreads 1 \
  --vcpus 8,sockets=1,cores=4,threads=2 \
  --cputune \
vcpupin0.vcpu=0,vcpupin0.cpuset=2,\
vcpupin1.vcpu=1,vcpupin1.cpuset=10,\
vcpupin2.vcpu=2,vcpupin2.cpuset=3,\
vcpupin3.vcpu=3,vcpupin3.cpuset=11,\
vcpupin4.vcpu=4,vcpupin4.cpuset=4,\
vcpupin5.vcpu=5,vcpupin5.cpuset=12,\
vcpupin6.vcpu=6,vcpupin6.cpuset=5,\
vcpupin7.vcpu=7,vcpupin7.cpuset=13,\
emulatorpin.cpuset='1,9',\
iothreadpin0.iothread=1,iothreadpin0.cpuset='1,9' \
  --cpu mode=host-passthrough,check=none,migratable=off,\
topology.sockets=1,topology.dies=1,topology.cores=4,topology.threads=2 \
  --machine q35 \
  --features \
hyperv.relaxed.state=on,\
hyperv.vapic.state=on,\
hyperv.spinlocks.state=on,\
hyperv.spinlocks.retries=8191,\
hyperv.vpindex.state=on,\
hyperv.runtime.state=on,\
hyperv.synic.state=on,\
hyperv.stimer.state=on,\
hyperv.stimer.direct.state=on,\
hyperv.reset.state=on,\
hyperv.frequencies.state=on,\
hyperv.reenlightenment.state=on,\
hyperv.tlbflush.state=on,\
hyperv.tlbflush.direct.state=on,\
hyperv.tlbflush.extended.state=on,\
hyperv.ipi.state=on,\
hyperv.evmcs.state=on,\
hyperv.avic.state=on,\
hyperv.emsr_bitmap.state=on,\
hyperv.xmm_input.state=on,\
smm=on \
  --boot \
loader=/run/libvirt/nix-ovmf/edk2-x86_64-secure-code.fd,\
loader.readonly=yes,loader.secure=yes,loader.type=pflash,\
nvram.template=/run/libvirt/nix-ovmf/edk2-i386-vars.fd \
  --tpm backend.type=emulator,backend.version=2.0,model=tpm-crb \
  --input type=mouse,bus=virtio \
  --input type=keyboard,bus=virtio \
  --disk type=file,device=disk,size=80,\
driver.name=qemu,\
driver.type=qcow2,\
driver.cache=none,\
driver.io=native,\
driver.discard=unmap,\
driver.iothread=1,\
source.file=/var/lib/libvirt/images/win10.qcow2,format=qcow2,\
target.dev=vda,target.bus=virtio \
  --network network=default,mac.address=52:11:45:14:19:19,model.type=virtio \
  --filesystem type=mount,accessmode=passthrough,\
driver.type=virtiofs,\
source.dir=/srv/virt_share_dir,\
target.dir=mount_tag \
  --rng model=virtio,backend.model=random,backend=/dev/random \
  --clock offset=localtime,\
timer0.name=rtc,timer0.tickpolicy=catchup,timer0.track=guest,\
timer1.name=pit,timer1.tickpolicy=delay,\
timer2.name=hpet,timer2.present=no,\
timer3.name=kvmclock,timer3.present=no,\
timer4.name=hypervclock,timer4.present=yes,\
timer5.name=tsc,timer5.present=yes,timer5.mode=native \
  --panic model=hyperv \
  --graphics spice \
  --os-variant win11 \
  --noautoconsole
```

> Use `macvtap` if you have wire adapter:
> ```bash
>   --network type=direct,\
> source=macvtap0,source.mode=vepa,\
> mac.address=52:11:45:14:19:19,\
> model.type=virtio \
> ```

> For qemu hook for dynamic hugepage allocation, see: https://github.com/magic0whi/nixos_configs_flake/blob/f84655a905a51af50718ecd3976062b2dc801c0e/machines/x86_64-linux/Proteus-NUC/virtualization.nix#L29

## Virtiofsssss: Shared file system

According to https://github.com/virtio-win/kvm-guest-drivers-windows/wiki/Virtiofs:-Shared-file-system, we need install WinFSP: https://github.com/winfsp/winfsp/releases

## References

[^1]: ["Using DMA-BUF with UEFI/OVMF - Intel GVT-g"](https://wiki.archlinux.org/title/Intel_GVT-g#Using_DMA-BUF_with_UEFI/OVMF). *wiki.archlinux.org*. Retrieved 2025-07-27.
[^2]: [libvirt: Domain XML format](https://libvirt.org/formatdomain.html)
