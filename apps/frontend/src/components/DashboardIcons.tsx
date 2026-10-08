import { SVGProps } from 'react';

function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden {...props}>
      {children}
    </svg>
  );
}

export function IconChart() {
  return (
    <Icon>
      <path d="M3 17h2v-7H3v7zm4 0h2V7H7v10zm4 0h2v-4h-2v4zm4 0h2V4h-2v13zm4 0h2v-9h-2v9z" />
    </Icon>
  );
}

export function IconStore() {
  return (
    <Icon>
      <path d="M4 4h16v2H4V4zm1 3h14l-1 13H6L5 7zm5 2v2h4V9h-4z" />
    </Icon>
  );
}

export function IconBox() {
  return (
    <Icon>
      <path d="M12 2 2 7v10l10 5 10-5V7L12 2zm0 2.2 7.5 3.75L12 11.7 4.5 7.95 12 4.2zM4 9.5l7 3.5v7.05l-7-3.5V9.5zm16 0v7.05l-7 3.5v-7.05l7-3.5z" />
    </Icon>
  );
}

export function IconCart() {
  return (
    <Icon>
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14h9.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 21.05 5H6.21L5.27 3H2v2h2l3.6 7.59-1.35 2.44C5.52 15.37 6.48 17 8 17h12v-2H7.42l.74-1z" />
    </Icon>
  );
}

export function IconUsers() {
  return (
    <Icon>
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </Icon>
  );
}

export function IconMail() {
  return (
    <Icon>
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z" />
    </Icon>
  );
}

export function IconHome() {
  return (
    <Icon>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
    </Icon>
  );
}

export function IconClipboard() {
  return (
    <Icon>
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </Icon>
  );
}

export function IconPlusSquare() {
  return (
    <Icon>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
    </Icon>
  );
}

export function IconLogout() {
  return (
    <Icon>
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
    </Icon>
  );
}

export function IconShop() {
  return (
    <Icon>
      <path d="M18 18H6V4h2v8l2.5-1.5L13 12V4h5v14zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z" />
    </Icon>
  );
}

export function IconClock() {
  return (
    <Icon>
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
    </Icon>
  );
}

export function IconMoney() {
  return (
    <Icon>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
    </Icon>
  );
}

export function IconMenu() {
  return (
    <Icon>
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </Icon>
  );
}

export function IconUser() {
  return (
    <Icon>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </Icon>
  );
}
