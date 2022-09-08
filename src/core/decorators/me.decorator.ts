import { fmsrvs } from '@fmfe/service';
import { User } from '@interfaces/users.interfaces';
import { createParamDecorator } from '@nestjs/common';

export const Me: User | any = createParamDecorator(setUser);

async function setUser(data, req): Promise<User> {
    if (req.user) {
        return req.user;
    }
    const userAndAccount = await fmsrvs.account.getUserInfoByToken(req.token, { noError: true });

    if (userAndAccount && userAndAccount.User) {
        req.user = userAndAccount.User;
        req.account = userAndAccount.AccountInfo;
        return req.user;
    }

    return null;
}
