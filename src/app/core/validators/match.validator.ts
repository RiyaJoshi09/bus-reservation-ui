import { AbstractControl, ValidatorFn } from '@angular/forms';

export function matchesField(otherName: string): ValidatorFn {
  return (control: AbstractControl) => {
    const other = control.parent?.get(otherName)?.value;
    return control.value === other ? null : { mismatch: true };
  };
}