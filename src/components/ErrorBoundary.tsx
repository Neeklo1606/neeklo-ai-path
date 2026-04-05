import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };

type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* avoid console noise in production; use monitoring if needed */
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-16 text-center">
          <p className="font-heading text-lg font-bold text-foreground">Что-то пошло не так</p>
          <p className="font-body text-sm text-muted-foreground mt-2 max-w-sm">
            Обновите страницу или вернитесь на главную.
          </p>
          <button
            type="button"
            className="mt-6 rounded-xl bg-primary px-6 py-3 text-primary-foreground font-body text-sm font-semibold"
            onClick={() => window.location.assign("/")}
          >
            На главную
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
