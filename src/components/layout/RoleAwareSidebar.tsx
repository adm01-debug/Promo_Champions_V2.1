import React from "react";
import { AppSidebar } from "../organisms/AppSidebar";

export const RoleAwareSidebar = React.memo(function RoleAwareSidebar() {
  return <AppSidebar />;
});

RoleAwareSidebar.displayName = "RoleAwareSidebar";