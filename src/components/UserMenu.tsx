"use client";

import type { ReactNode } from "react";

export type UserMenuProps = {
  name: string;
  email?: string;
  role?: string;
  signOutHref: string;
  /** Absolute URL of the user's profile picture (from the SSO). */
  avatarUrl?: string;
  children?: ReactNode;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function UserMenu({
  name,
  email,
  role,
  signOutHref,
  avatarUrl,
  children,
}: UserMenuProps) {
  return (
    <details className="iipe-user-menu">
      <summary>
        {avatarUrl ? (
          <img
            className="iipe-user-avatar-img"
            src={avatarUrl}
            alt=""
            width={26}
            height={26}
          />
        ) : (
          <span className="iipe-user-avatar">{initials(name) || "?"}</span>
        )}
        <span className="iipe-user-name">{name.split(" ")[0]}</span>
      </summary>
      <div className="iipe-dropdown">
        <div className="iipe-dropdown-header">
          <div className="iipe-dropdown-name">{name}</div>
          {role && <div className="iipe-dropdown-meta">{role}</div>}
          {email && <div className="iipe-dropdown-meta">{email}</div>}
        </div>
        {children}
        <a className="iipe-danger-link" href={signOutHref}>
          Sign out
        </a>
      </div>
    </details>
  );
}
