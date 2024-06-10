import React from 'react'
import { Button } from '@gear-js/vara-ui';
import { useContractUtils } from '@/app/hooks';
import { useAccount, useAlert } from '@gear-js/react-hooks';
import { CONTRACT } from '@/app/consts';

import '../ButtonsContainer.css';

export const NormalButtons = () => {
    const { account } = useAccount();
    const { sendMessage } = useContractUtils();
    const alert = useAlert();

    return (
        <div className='buttons-container'>
            <Button onClick={async () => {
                if (!account) {
                    alert.error("Accounts not ready!");
                    return;
                }

                try {
                    await sendMessage(
                        account.decodedAddress,
                        account.meta.source,
                        CONTRACT.programId,
                        CONTRACT.metadata,
                        {
                            Ping: {
                                useAccount: [null, null]
                            }
                        },
                        0,
                        () => alert.success('message send!'),
                        () => alert.error('Error while sending message!'),
                        () => alert.info('Message in block!'),
                        () => alert.info('will send a message')
                    );
                } catch (e) {
                    alert.error('Error while sending message');
                }
            }}>
                Send Ping
            </Button>
            <Button onClick={async () => {
                if (!account) {
                    alert.error("Accounts not ready!");
                    return;
                }

                try {
                    await sendMessage(
                        account.decodedAddress,
                        account.meta.source,
                        CONTRACT.programId,
                        CONTRACT.metadata,
                        {
                            Pong: {
                                useAccount: [null, null]
                            }
                        },
                        0,
                        () => alert.success('message send!'),
                        () => alert.error('Error while sending message!'),
                        () => alert.info('Message in block!'),
                        () => alert.info('will send a message')
                    );
                } catch (e) {
                    alert.error('Error while sending message');
                }
            }}>
                Send Pong
            </Button>
        </div>
    )
}
