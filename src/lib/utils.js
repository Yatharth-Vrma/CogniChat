export function cn(...args) {
  return args.filter(Boolean).join(" ");
}
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}