export interface ShellFrameProps {
  title?: string;
  description?: string;
  maxWidth?: string;
}

export interface AppShellProps extends ShellFrameProps {
  centered?: boolean;
  padded?: boolean;
}

export interface PageShellProps extends ShellFrameProps {
  compact?: boolean;
}

export interface SectionCardProps extends ShellFrameProps {
  elevated?: boolean;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
}

