## Main

- Install Microsoft Store
  ```powershell
  wsreset -i
  ```
- Use UTC
  ```powershell
  reg add "HKLM\SYSTEM\CurrentControlSet\Control\TimeZoneInformation" /v RealTimeIsUniversal /t REG_DWORD /d 1 /f
  ```
- Disable Fast Boot (Not very sensible on SSD)
  ```powershell
  reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Power" /v HiberbootEnabled /t REG_DWORD /d 0 /
  ```
- Disable WFP logging for Port Scanning Prevention Filter, which generate senseless writes for SSD
  ```powershell
  netsh wfp set options netevents=off
  ```

## Reference

1. [Windows 安装指南](https://mirrors.sdu.edu.cn/docs/guide/Windows-iso/)
