import React, { memo } from "react";
import { AppSidebar } from "./AppSidebar";

export const RoleAwareSidebar = memo(function RoleAwareSidebar() {
  return <AppSidebar />;
});

RoleAwareSidebar.displayName = "RoleAwareSidebar";