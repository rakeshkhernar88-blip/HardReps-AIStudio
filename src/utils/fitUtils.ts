/**
 * Parses Google Fit response data for steps.
 */
export const parseStepsData = (response: any) => {
  if (!response || !response.bucket) return 0;
  
  let totalSteps = 0;
  response.bucket.forEach((bucket: any) => {
    if (bucket.dataset) {
      bucket.dataset.forEach((dataset: any) => {
        if (dataset.point) {
          dataset.point.forEach((point: any) => {
            if (point.value) {
              point.value.forEach((v: any) => {
                if (v.intVal) totalSteps += v.intVal;
                if (v.fpVal) totalSteps += v.fpVal;
              });
            }
          });
        }
      });
    }
  });

  return Math.round(totalSteps);
};
