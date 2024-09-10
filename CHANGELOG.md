# v2.0.0

- update @vcmap/core and @vcmap/ui to 6.x
- use new custom icon functionality

# v1.0.5

- Fixes bug where uuid was displayed as name
- Fixes bug where only single changes in buttonEditor were possible

# v1.0.4

- Remove previously added notification for duplicate title and move input validation to config editor.

# v1.0.3

- Fixes bug where the `LinkButtonConfigEditor` created an invalid config, since name was missing.
- Add Notification if button with same title already exists and therefore is not added.

# v1.0.2

- Fixes bug that made it impossible to add a first button with the editor if there is not at least an empty array for `buttons` in the config.
