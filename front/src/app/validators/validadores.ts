import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const REGEX_PASSWORD = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export const passwordFuerte: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const valor: string = control.value ?? '';
  if (!valor) return null;
  return REGEX_PASSWORD.test(valor) ? null : { passwordDebil: true };
};

export function camposIguales(campo: string, confirmacion: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const control = grupo.get(campo);
    const controlConfirmacion = grupo.get(confirmacion);
    if (!control || !controlConfirmacion) return null;

    if (controlConfirmacion.value && control.value !== controlConfirmacion.value) {
      controlConfirmacion.setErrors({ ...controlConfirmacion.errors, noCoinciden: true });
      return { noCoinciden: true };
    }

    if (controlConfirmacion.hasError('noCoinciden')) {
      const { noCoinciden, ...resto } = controlConfirmacion.errors ?? {};
      controlConfirmacion.setErrors(Object.keys(resto).length ? resto : null);
    }
    return null;
  };
}

export const edadMinima = (anios: number): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const nacimiento = new Date(control.value);
    const hoy = new Date();
    if (nacimiento > hoy) return { fechaFutura: true };

    const limite = new Date(hoy.getFullYear() - anios, hoy.getMonth(), hoy.getDate());
    return nacimiento > limite ? { menorDeEdad: { anios } } : null;
  };
};
