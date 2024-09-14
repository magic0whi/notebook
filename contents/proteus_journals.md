## Daily Journals プロテウスの日記

### 09-13-24

Morning
- Waked up around 9:30, today's sleep quality is awful, Since I was got into sleeping around 3:00 (I'm now hard to falling sleep even with the helps of 5 mg Zolpidem).
- Trying to install NixOS (`nixos-gnome-24.11pre669741.c374d94f1536-x86_64-linux.iso`). No luck, the sing-box sniff feature doesn't work. Through the sing-box can process itself traffics correctly (proxy lines show latency in WebUI), all the DNS requests from Firefox as well as from other programs cannot get any DNS responses in NixOS's installation medium. I tried w/o FakeIP, no luck, same result. Other platforms (such as Arch Linux, Windows 11), don't have this strange issue. Observing the log (level: info), it can be seemed that sing-box successfully resolves the domains and outputs the correspondent A or AAAA addresses, so probably sing-box has trouble in sending back the DNS response to the user program.

  The seconds trouble is that NixOS's official GUI installation guide recognize my RAID-0 volume (created by `mdadm`) as a normal disk and forces me to create a GPT on the volume, even more absurd is that the ESP partition can only stay in that RAID volume (apparently my UEFI Firmware doesn't happy with that, as it only supports metadata of Intel&copy; Matrix Storage Manager).

  After conducing the Google and ArchWiki, I found that the ZFS has a stable RAID feature built-in, and it looks resulting a simpler layout than the scheme of Btrfs upon mdadm's FakeRAID.

  As for now, the NixOS installation medium doesn't support Secure Boot at all, which says its grub refuse to boot even after a valid signature signed.

  One more defect on NixOS installation medium, the 802.11ax connection quality is poor on my NUC X15 (the wireless adapter model is AX201).

### 09-14-24

- Cleaned up explicitly installed packages on my laptop that not frequently use, supplements some missing packages (such as `texlive-langjapanese`, `texlive-latexextra`) into my chezmoi's manifest.
- `mkinitcpio-dsdt-hook` to `mkinitcpio`'s built-in hook `acpi_override`.
- Continue to check my music library.
- I finally realized that the malfunction of sing-box may due to firewall rules. After read [NixOS Manual - Firewall](https://nixos.org/manual/nixos/unstable/index.html#sec-firewall), I put `networking.firewall.enable = false;` in the `/etc/nixos/configuration.nix`, and it now works as normal.
