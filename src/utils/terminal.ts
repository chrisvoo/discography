import chalk from 'chalk';
import util from 'util';

const err = chalk.bold.red;
const warn = chalk.keyword('orange');
const ok = chalk.keyword('green');

export function error(message: string): void {
  console.log(err(message));
}

export function warning(message: string): void {
  console.log(warn(message));
}

export function success(message: string): void {
  console.log(ok(message));
}

export function showResult(obj: any): void {
  console.log(util.inspect(obj, {
    colors: true,
    depth: null,
    showHidden: false,
  }));
}
