import { useContext, useState } from 'react'
import { Button } from '@gear-js/vara-ui';
import { useAccount, useAlert } from '@gear-js/react-hooks';
import { dAppContext } from '@/Context/dappContext';
import { SignlessForm } from '../SignlessForm/SignlessForm';
import { 
    useContractUtils, 
    useVoucherUtils, 
} from '@/app/hooks';
import { 
    sponsorName,
    sponsorMnemonic
} from '@/app/consts';
import { decodeAddress } from '@gear-js/api';
import { CONTRACT } from '@/app/consts';

import '../ButtonsContainer.css';


export const SignlessButtons = () => {
    const { account } = useAccount();
    const { 
        currentVoucherId,
        signlessAccount,
        noWalletSignlessAccountName,
    } = useContext(dAppContext);
    const {
        sendMessageWithSignlessAccount,
    } = useContractUtils();
    const {
        checkVoucherForUpdates,
    } = useVoucherUtils(sponsorName, sponsorMnemonic);
    const alert = useAlert();

    const [userFillingTheForm, setUserFillingTheForm] = useState(false);

    const sendMessageWithPayload = async (payload: any) => {
        if (!signlessAccount) {
            alert.error('no signless account!');
            return
        }

        if (!currentVoucherId) {
            alert.error('No voucher for sigless account!');
            return;
        }

        try {
            await checkVoucherForUpdates(
                decodeAddress(signlessAccount.address),
                currentVoucherId,
                1,
                1_200, 
                2,
                () => alert.success('Voucher get an update!'),
                () => alert.error('Error while updating voucher'),
                () => alert.info('Check voucher for updates...')
            );
        } catch(e) {
            alert.error('Error while updating signless account voucher');
            return;
        }

        try {
            await sendMessageWithSignlessAccount(
                signlessAccount,
                CONTRACT.programId,
                currentVoucherId,
                CONTRACT.metadata,
                payload,
                0,
                () => alert.success('Message send wuth signless Account!'),
                () => alert.error('Error while sending message'),
                () => alert.info('Message in block!'),
                () => alert.info('Will send a message')
            )
        } catch (e) {
            alert.error('Error while sending signless account');
            return;
        }
    }

    return (
        <div className='buttons-container'>
            <Button 
                isLoading={userFillingTheForm}
                onClick={async () => {
                    if (!signlessAccount) {
                        setUserFillingTheForm(true);
                        return;
                    }

                    await sendMessageWithPayload(
                        account ?
                        {
                            Ping: {
                                userAccount: [
                                    account.decodedAddress, 
                                    null
                                ]
                            }
                        }
                        :
                        {
                            Ping: {
                                userAccount: [
                                    null,
                                    noWalletSignlessAccountName ?? ""
                                ]
                            }
                        }
                    );
                }}
            >
                Send Ping with signless
            </Button>
            <Button 
                isLoading={userFillingTheForm}
                onClick={async () => {
                    if (!signlessAccount) {
                        setUserFillingTheForm(true);
                        return;
                    }

                    await sendMessageWithPayload(
                        account ?
                        {
                            Pong: {
                                userAccount: [
                                    account.decodedAddress, 
                                    null
                                ]
                            }
                        }
                        :
                        {
                            Pong: {
                                userAccount: [
                                    null,
                                    noWalletSignlessAccountName ?? ""
                                ]
                            }
                        }
                    );
                }}
            >
                Send Pong with signless account
            </Button>
            {
                userFillingTheForm && 
                <SignlessForm closeForm={() => {
                    setUserFillingTheForm(false);
                }}/>
            }
        </div>
    )
}
