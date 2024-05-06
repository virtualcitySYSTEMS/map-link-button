# @vcmap/link-button

> Part of the [VC Map Project](https://github.com/virtualcitySYSTEMS/map-ui)

This plugin allows to add multiple buttons to the UI which link e.g. to another online GIS system. It provides different location and orientation related variables that can be added to the URL using a template notation.

## Configuration

| Property  | Type                | default | Description                                                     |
| --------- | ------------------- | ------- | --------------------------------------------------------------- |
| 'buttons' | `Array<LinkButton>` | []      | Array with the configuration of the [Link Buttons](#linkbutton) |

### LinkButton

| Property         | Type                | default                                                                       | Description                                                                                                             |
| ---------------- | ------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 'templateUrl'    | `string`            | required                                                                      | A URL using [template notation](#template-url) to add current location and orientation of the map.                      |
| 'title'          | `string`            | 'Open external link'                                                          | The title and tooltip of the action button.                                                                             |
| 'icon'           | `string`            | '$vcsExternalLink'                                                            | The icon of the Button. Can either be a [Material Design Icon](https://pictogrammers.com/), a VCS Icon or a (data-)URL. |
| 'buttonLocation' | `ButtonLocation`    | 2                                                                             | The Location of the button in the UI. Currently only 'TOOL' (2) and 'MENU' (5) supported.                               |
| `projection`     | `ProjectionOptions` | { epsg: 'EPSG:4326', proj4: '+proj=longlat +datum=WGS84 +no_defs +type=crs' } | Projection definition for extent, groundPosition and cameraPosition.                                                    |

### Template URL

In order to add information about current location and orientation in the map, double curly braces with [variables](#available-variables) can be added to the URL.

> Example: `https://new.virtualcitymap.de/?state=[[[{{cameraPosition}}],[{{groundPosition}}],{{distance}},{{heading}},{{pitch}},{{roll}}],"cesium",["VC Map Demo"]]`

#### Available variables

| name             | description                                                                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 'groundPosition' | Position on Ground that is focused by the current view. Therefore can be used as center.                                                                   |
| 'cameraPosition' | Position of camera. In 2D this is undefined.                                                                                                               |
| 'distance'       | Distance of the camera to the ground.                                                                                                                      |
| 'heading'        | Heading of the camera in degrees (0 = North).                                                                                                              |
| 'pitch'          | Pitch of camera in degrees ranging from -90 to 90.                                                                                                         |
| 'roll'           | Roll of camera in degrees.                                                                                                                                 |
| 'extent'         | The extent of the current view as array with `[xmin, ymin, xmax, ymax]`. In 3D the ground position is used with heading 0 (north) and pitch 90 (top view). |
