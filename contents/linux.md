# Concepts on Linux

## SystemD

| Section Options | Description |
| --------------- | ----------- |
| `Wants=` | If this unit gets activated, the units listed will be activated as well |
| `Requires=` | Similar to `Wants=`. Will not start if one of the units fails to activate and `After=` is set. Stop if one of the units *explicitly* stopped |
| `BindsTo=` | In addition to the effect of `Requires=`. If the unit bound to is stopped, this unit will be stopped too |

Requirement dependencies do not influence the order in which services are started or stopped. This has to be configured independently with the `After=` or `Before=` options.

| Section Options | Description |
| --------------- | ----------- |
| `PartOf=` | When systemd stops or restarts the units listed here, the action is propagated to this unit |
