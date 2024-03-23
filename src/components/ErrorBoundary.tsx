import { Box, Heading, Text } from "@primer/react";
import React, { PropsWithChildren } from "react";

type State = {
  hasError: boolean;
  error: unknown;
};

export class ErrorBoundary extends React.Component<PropsWithChildren<unknown>, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      return (
        <Box display="flex" flexDirection="column" sx={{ gap: 2 }}>
          <Heading>Error</Heading>
          <Text>{error instanceof Error ? error?.message : `${error ?? "Unknown error"}`}</Text>
        </Box>
      );
    }

    return this.props.children;
  }
}
