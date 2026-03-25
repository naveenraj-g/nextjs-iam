import { IOAuthClientService } from "../core/admin/domain/interfaces/oauthclient.service.interface";
import { IUsersService } from "../core/admin/domain/interfaces/users.service.interface";
import { ISessionsService } from "../core/admin/domain/interfaces/sessions.service.interface";
import { IOrganizationsService } from "../core/admin/domain/interfaces/organizations.service.interface";
import { IAuthService } from "../core/auth/domain/interfaces/auth.service.interface";
import { IEmailService } from "../core/common/email/domain/interfaces/email.service.interface";

export const DI_SYMBOLS = {
  // Repositories

  // Services
  IAuthService: Symbol.for("IAuthService"),
  IEmailService: Symbol.for("IEmailService"),
  IOAuthClientService: Symbol.for("IOAuthClientService"),
  IUsersService: Symbol.for("IUsersService"),
  ISessionsService: Symbol.for("ISessionsService"),
  IOrganizationsService: Symbol.for("IOrganizationsService"),
};

export interface DI_RETURN_TYPES {
  // Repositories

  // Services
  IAuthService: IAuthService;
  IEmailService: IEmailService;
  IOAuthClientService: IOAuthClientService;
  IUsersService: IUsersService;
  ISessionsService: ISessionsService;
  IOrganizationsService: IOrganizationsService;
}
