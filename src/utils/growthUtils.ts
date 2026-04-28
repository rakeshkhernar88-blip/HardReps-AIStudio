/**
 * Calculates the growth months and milestones for body prediction.
 */
export const calculateTimeline = (currentSize: number, targetSize: number, frequency: number, diet: string) => {
  const diff = targetSize - currentSize;
  const growthRate = frequency * (diet === 'Bulk' ? 0.3 : diet === 'Maintain' ? 0.1 : 0.05);
  const months = Math.max(1, Math.ceil(diff / growthRate));

  const milestoneData = Array.from({ length: 6 }, (_, i) => ({
    x: i,
    y: currentSize + (i * growthRate > diff ? diff : i * growthRate)
  }));

  return { months, milestoneData };
};
