import { toast } from "sonner";

export const notify = {
  success: (title, options = {}) => {
    const { description, ...rest } = options;
    if (description) return toast.success(title, options);
    return toast.success(title, { ...rest });
  },
  error: (title, options = {}) => {
    const { description, ...rest } = options;
    if (description) return toast.error(title, options);
    return toast.error(title, { ...rest });
  },
  loading: (title, options = {}) => {
    const { description, ...rest } = options;
    if (description) return toast.loading(title, options);
    return toast.loading(title, { ...rest });
  },
  info: (title, options = {}) => {
    const { description, ...rest } = options;
    if (description) return toast.info(title, options);
    return toast.info(title, { ...rest });
  },
  warning: (title, options = {}) => {
    const { description, ...rest } = options;
    if (description) return toast.warning(title, options);
    return toast.warning(title, { ...rest });
  },
  dismiss: (toastId) => toast.dismiss(toastId),
  promise: (promise, messages, options = {}) =>
    toast.promise(promise, messages, options),
  custom: (jsx, options = {}) => toast.custom(jsx, options),
};
