export function joinClasses(...classNames: (string | undefined)[]): string {
  return classNames.filter((className): className is string => Boolean(className)).join(" ");
}
