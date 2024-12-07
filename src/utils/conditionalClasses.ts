export default function conditionalClasses(
  baseClasses: string | string[],
  conditional: Record<string, boolean>
): string {
  const classes = typeof baseClasses === 'string' ? [baseClasses] : baseClasses;

  for (const [className, render] of Object.entries(conditional)) {
    if (render) {
      classes.push(className);
    }
  }

  return classes.join(' ');
}
