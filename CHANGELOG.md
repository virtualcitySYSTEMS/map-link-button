# v2.0.3

- Added visibility option configuration

# v2.0.2

- Fix bug, where returned extent in ObliqueMap was incorrect

# v2.0.1

- Fix bug in config editor, where previously configured buttons could not be edited

# v2.0.0

- updates @vcmap/core and @vcmap/ui to 6.x
- uses new custom icon functionality

# v1.0.5

- Fixes bug where uuid was displayed as name
- Fixes bug where only single changes in buttonEditor were possible

# v1.0.4

- Removes previously added notification for duplicate title and move input validation to config editor.

# v1.0.3

- Fixes bug where the `LinkButtonConfigEditor` created an invalid config, since name was missing.
- Adds Notification if button with same title already exists and therefore is not added.

# v1.0.2

- Fixes bug that made it impossible to add a first button with the editor if there is not at least an empty array for `buttons` in the config.
