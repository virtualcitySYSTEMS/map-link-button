import {
  CesiumMap,
  ObliqueMap,
  OpenlayersMap,
  Projection,
  ProjectionOptions,
  wgs84Projection,
} from '@vcmap/core';
import { VcsUiApp, replaceAttributes } from '@vcmap/ui';
import { getLogger } from '@vcsuite/logger';
import { name } from '../package.json';

/**
 * @param coords in wgs84
 * @param bearing in radian
 * @param distance in meters
 * @returns new position in wgs84
 */
function moveOnEarthAsSphere(
  coords: number[],
  bearing: number,
  distance: number,
): number[] {
  const lon1Rad = (coords[0] * Math.PI) / 180;
  const lat1Rad = (coords[1] * Math.PI) / 180;
  const earthRadius = 6371008.8;

  const lat2Rad = Math.asin(
    Math.sin(lat1Rad) * Math.cos(distance / earthRadius) +
      Math.cos(lat1Rad) * Math.sin(distance / earthRadius) * Math.cos(bearing),
  );
  const lon2Rad =
    lon1Rad +
    Math.atan2(
      Math.sin(bearing) * Math.sin(distance / earthRadius) * Math.cos(lat1Rad),
      Math.cos(distance / earthRadius) - Math.sin(lat1Rad) * Math.sin(lat2Rad),
    );

  return [lon2Rad / (Math.PI / 180), lat2Rad / (Math.PI / 180)];
}

/**
 * @param canvas The target of the cesium map
 * @param distance Distance of camera to surface in meters
 * @param center Center of current view in wgs84
 * @returns The extent as [xmin, ymin, xmax, ymax]
 */
function calculateExtentForCesium(
  canvas: HTMLElement,
  distance: number,
  center: number[],
): number[] {
  const angleOfViewX = Math.PI / 3.0;

  const { clientWidth, clientHeight } = canvas;
  const targetAspectRatio = clientWidth / clientHeight;
  const fieldOfViewX = 2 * Math.tan(angleOfViewX / 2) * distance;
  const fieldOfViewY = fieldOfViewX / targetAspectRatio;

  const hypotenuse = Math.sqrt(
    fieldOfViewX * fieldOfViewX + fieldOfViewY * fieldOfViewY,
  );

  return [
    ...moveOnEarthAsSphere(
      center,
      Math.PI / 2 - Math.atan2(fieldOfViewY, fieldOfViewX) + Math.PI,
      hypotenuse / 2,
    ),
    ...moveOnEarthAsSphere(
      center,
      Math.PI / 2 - Math.atan2(fieldOfViewY, fieldOfViewX),
      hypotenuse / 2,
    ),
  ];
}

export async function createUrl(
  app: VcsUiApp,
  templateUrl: string,
  projectionOptions?: ProjectionOptions,
): Promise<string> {
  const { activeMap } = app.maps;
  const viewpoint = await activeMap?.getViewpoint();
  if (!viewpoint) {
    throw new Error('no active map or viewpoint');
  }

  const { distance, heading, pitch, roll } = viewpoint;
  let { groundPosition, cameraPosition } = viewpoint;

  let extent: number[] = [];

  if (activeMap instanceof CesiumMap) {
    const canvas = activeMap.getScene()?.canvas;
    if (canvas && distance && groundPosition) {
      extent = calculateExtentForCesium(canvas, distance, groundPosition);
    }
  } else if (
    (activeMap instanceof OpenlayersMap || activeMap instanceof ObliqueMap) &&
    activeMap.olMap
  ) {
    const mercatorExtent = activeMap.olMap?.getView().calculateExtent();
    extent = [
      ...Projection.mercatorToWgs84([mercatorExtent[0], mercatorExtent[1]]),
      ...Projection.mercatorToWgs84([mercatorExtent[2], mercatorExtent[3]]),
    ];
  }

  const isValidProjection =
    projectionOptions && Projection.validateOptions(projectionOptions);
  if (projectionOptions && !isValidProjection) {
    getLogger(name).warning('projection not valid');
  }
  const parsedEpsg = Projection.parseEPSGCode(projectionOptions?.epsg);
  if (parsedEpsg && parsedEpsg !== wgs84Projection.epsg && isValidProjection) {
    const targetProjection = new Projection(projectionOptions);
    if (groundPosition) {
      groundPosition = targetProjection.transformFrom(
        wgs84Projection,
        groundPosition,
      );
    }
    if (cameraPosition) {
      cameraPosition = targetProjection.transformFrom(
        wgs84Projection,
        cameraPosition,
      );
    }
    if (extent.length) {
      extent = [
        ...targetProjection.transformFrom(wgs84Projection, [
          extent[0],
          extent[1],
        ]),
        ...targetProjection.transformFrom(wgs84Projection, [
          extent[2],
          extent[3],
        ]),
      ];
    }
  }
  const url = replaceAttributes(templateUrl, {
    groundPosition,
    cameraPosition,
    distance,
    heading,
    pitch,
    roll,
    extent,
  });

  return encodeURI(url);
}

export function openUrl(url: string): void {
  const anchorElement = document.createElement('a');
  anchorElement.href = url;
  anchorElement.target = '_blank';
  document.body.appendChild(anchorElement);
  anchorElement.click();
  anchorElement.parentNode?.removeChild(anchorElement);
}
