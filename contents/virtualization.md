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
      <source file='/mnt/storage4/win10.qcow2'/>
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

## References

[^1]: ["Using DMA-BUF with UEFI/OVMF - Intel GVT-g"](https://wiki.archlinux.org/title/Intel_GVT-g#Using_DMA-BUF_with_UEFI/OVMF). *wiki.archlinux.org*. Retrieved 2025-07-27.
