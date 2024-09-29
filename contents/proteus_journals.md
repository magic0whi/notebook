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

### 09-15-24

Afternoon
- I managed to configure a systemd-nspawn container running NixOS on my laptop. For network concerns, firstly I tried to assign it with a IPVLAN device, but soon encountered difficulties. The `ipvlan0` interface was unable to receive a DHCPv4 from my router. After googling I found that the wireless adapter has difficulty with network bridge-like functions (Wi-Fi auth only allows a single MAC address for a client), whereas the IPVLAN is completely a different situation since it shares the same MAC address.
- Sooner I realized that I don't really need a standalone IP within the LAN for the container, since it supposed to be a test environment to get started with NixOS and I should not run any public services in it.
- Went through another period of struggling and researching to get peace with nftables and systemd-nspawn, the container finally got its internet connection.

Night
- The first run of `nixos-rebuild switch` was not smoothly as well, the nix sandbox doesn't work initially, `nixos-rebuild switch --option sandbox false` resolves this. Since I use systemd-resolved, the default name server is set to `127.0.0.53`, manually edit `/etc/resolv.conf` and put `services.resolved.enabe = true;` in `configuration.nix`. Next the systemd-resolved module complains it cannot be companies with `networking.useHostResolvConf = true;`, ok let me set it to `false` explicitly.
- There is a stronger and stronger feeling that I definitely should set a quota for each target everyday I want to complete, so a single blockage would have a time limit and don't consume the whole day. This may also filter things that eventually proved to be useless or out-dated as the time beings. Probably one day I happened to hear someone says hey there is a better alternate for something, but unfortunately it requires learning from zero since it's an overall completely new well-formed designed (i.e. OpenGL to Vulcan).

### 09-16-24

Morning & Afternoon
- lighttpd: vhost
- bind: DNSSEC (failed).

### 09-22-24

- Go to Shanghai totally relies on railway transit.

### 09-23-24

- Unregistered the Standard Chartered Bank since it has bad exchange rates and its system doesn't allow the real name of the tied phone number to be different with the bank account owner, even this phone line is owned by my father and I carried a valid kinship certificate with. (I mentioned that any other banks in China were accepted in such situation but the SCB's teller only says sorry), I can't tell if branches other than Suzhou can have this simple work done.
- Round and round in 蘇州中心 and 星悅匯, the latter now bracing the subculture of <ruby>二次元<rt>にじげん</rt></ruby>.

### 09-27-24

- Daily small task changes: Purchasing foreign currency twice/day (from once/day);
- Testing Cloudflare's Wrap (Zero Trust) on Windows with sing-box for traffic routing;

### 09-28-24

- Scanned some documents left in the drawer. (Yet to be renamed and properly store)
- Completed Calculus 1A: Differentiation
