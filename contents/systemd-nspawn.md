# systemd-nspawn

## Container bringup

Here using Tencent Meeting as an example

```shell-session
# cd /var/lib/machines
# container_name=wemeet
# btrfs subvolume create ${container_name}
```

### Install `.debs` in an Ubuntu container

```shell-session
# codename=Noble
# repository_url='https://repo.huaweicloud.com/ubuntu/'
# debootstrap --include=systemd-container \
--components=main,universe,multiverse \
${codename} ${container_name} ${repository_url}
```

Login in to the container just created:
```shell-session
# cp /path/to/TencentMeeting_0300000000_2.8.0.3_x86_64_default.publish.deb /var/lib/machines/container_name/root/
# systemd-nspawn --machine=${container_name} --bind-ro=/etc/resolv.conf
root@wemeet # dpkg -i TencentMeeting_0300000000_2.8.0.3_x86_64_default.publish.deb
root@wemeet # apt -f install # Install dependencies
root@wemeet # apt install xorg
root@wemeet # ln -s /opt/wemeet/wemeetapp.sh /usr/local/bin/wemeet
root@wemeet # useradd -m wemeet
root@wemeet # su --login wemeet --shell /bin/bash
wemeet@wemeet $ mkdir --parents ~/.config ~/.local/share
```

Wrapping things up
1. Desktop shortcut
   ```ini
   # ~/.local/share/applications/wemeet.desktop
   [Desktop Entry]
   Comment=Tencent Video Conferencing
   Exec=/home/proteus/.local/bin/wemeet
   Icon=/path/to/wemeetapp.png
   Name=Tencent Meeting
   Terminal=false
   Type=Application
   ```
2. Startup script

   TODO: Wayland
   ```bash
   # ~/.local/bin/wemeet
   #!/bin/bash
   app=wemeet
   home=/home/$app
   host_data=/usr/share
   data=$home/.local/share
   host_conf=${XDG_CONFIG_HOME:-~/.config}
   conf=${home}/.config
   options="--as-pid2 --machine=$app --user=$app --chdir=$home"
   
   # Tray
   host_dbus=${DBUS_SESSION_BUS_ADDRESS#unix:path=}
   [ -z "$host_dbus" ] && host_dbus="/run/user/$(id --user)/bus"
   cont_dbus=/run/user/host/bus
   options="$options --bind-ro=$host_dbus:$cont_dbus --setenv=DBUS_SESSION_BUS_ADDRESS=unix:path=$cont_dbus"
   
   # Sound
   host_pulse=${PULSE_SERVER#unix:}
   [ -z "${host_pulse}"] && host_pulse="/run/user/$(id --user)/pulse/native"
   cont_pulse=/run/user/host/pulse
   options="$options --bind-ro=$host_pulse:$cont_pulse --setenv=PULSE_SERVER=unix:$cont_pulse" 
   
   # Icons
   options="$options --bind-ro=$host_data/icons:$data/icons --setenv=XCURSOR_PATH=$data/icons"
   
   # Fonts
   options="$options --bind-ro=$host_data/fonts:$data/fonts --bind-ro=$host_conf/fontconfig:$conf/fontconfig"
   
   # Display
   options="$options --bind-ro=/tmp/.X11-unix/ --setenv=DISPLAY=$DISPLAY"
   xauth_file="/tmp/xauth-$app"
   touch $xauth_file
   xauth nextract - "$DISPLAY" | sed -e 's/^..../ffff/' | xauth -f "$xauth_file" nmerge -
   options="$options --bind=$xauth_file --setenv=XAUTHORITY=$xauth_file"
   
   # Devices
   options="$options --bind=/dev/dri/ --property=DeviceAllow='char-drm rw'" # Graphic cards
   options="$options --bind=/dev/input/ --property=DeviceAllow='char-input r'" # Joysticks
   
   echo "List of cmdline options applied to systemd-nspawn:"
   printf "%s\n" ${options} | sort
   
   # resolv.conf
   options="${options} --bind-ro=/etc/resolv.conf"
   
   pkexec systemd-nspawn $options $app
   ```

## Reference

1. [Containerize Steam with systemd-nspawn](https://liolok.com/containerize-steam-with-systemd-nspawn/)
