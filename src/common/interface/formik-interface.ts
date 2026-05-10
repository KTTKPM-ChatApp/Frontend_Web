export interface FormikLike<TValues extends Record<string, any> = Record<string, any>> {
  values: TValues;
  touched: Partial<Record<keyof TValues, boolean>>;
  errors: Partial<Record<keyof TValues, string>>;

  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;

  validateForm?: () => Promise<Partial<Record<keyof TValues, string>>>;
  setTouched?: (
    touched: Partial<Record<keyof TValues, boolean>>,
    shouldValidate?: boolean
  ) => void;
}
