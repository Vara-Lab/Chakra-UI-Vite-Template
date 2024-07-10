import React, { useContext } from 'react'
import { Button } from '@/components/ui/button';
import { useContractUtils, useVoucherUtils } from '@/app/hooks';
import { useAccount, useAlert } from '@gear-js/react-hooks';
import { sponsorName, sponsorMnemonic } from '@/app/consts';
import { dAppContext } from '@/Context/dappContext';
import { CONTRACT } from '@/app/consts';

import '../ButtonsContainer.css';
import { HexString } from '@gear-js/api';

export const VoucherButtons = () => {
    const { account } = useAccount();
    const { 
        currentVoucherId,
        setCurrentVoucherId
    } = useContext(dAppContext);
    const {
        sendMessageWithVoucher
    } = useContractUtils();
    const {
        generateNewVoucher,
        checkVoucherForUpdates,
        vouchersInContract
    } = useVoucherUtils(sponsorName, sponsorMnemonic);

    const alert = useAlert();

    const voucherIdOfActualPolkadotAccount = async (): Promise<HexString[]> => {
        return new Promise(async (resolve, reject) => {
            if (!account) {
                alert.error('Account is not ready');
                reject('Account is not ready');
                return;
            }

            const vouchersId = await vouchersInContract(
                CONTRACT.programId,
                account.decodedAddress
            );

            resolve(vouchersId);
        });
    }

    const manageVoucherId = async (voucherId: HexString): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            if (!account) {
                alert.error('Account is not ready');
                reject('Account is not ready');
                return;
            }

            try {
                await checkVoucherForUpdates(
                    account.decodedAddress, 
                    voucherId,
                    1, // add one token to voucher if needed
                    1_200, // new expiration time (One hour )
                    2, // Minimum balance that the voucher must have
                    () => alert.success('Voucher updated!'),
                    () => alert.error('Error while checking voucher'),
                    () => alert.info('Will check for updates in voucher')
                )
                resolve();
            } catch (e) {
                alert.error('Error while check voucher');
            }
        });
    }

    const createVoucherForCurrentPolkadotAccount = async (): Promise<HexString> => {
        return new Promise(async (resolve, reject) => {
            if (!account) {
                alert.error('Account is not ready');
                reject('Account is not ready');
                return;
            }

            const voucherIdCreated = await generateNewVoucher(
                [CONTRACT.programId], // An array to bind the voucher to one or more contracts
                account.decodedAddress,
                2, // 2 tokens
                30, // one minute
                () => alert.success('Voucher created!'),
                () => alert.error('Error while creating voucher'),
                () => alert.info('Will create voucher for current polkadot address!'),
            );

            if (setCurrentVoucherId) setCurrentVoucherId(voucherIdCreated);

            resolve(voucherIdCreated);
        });
    }

    return (
        <div className='buttons-container'>
            <Button onClick={async () => {
                if (!account) {
                    alert.error("Accounts not ready!");
                    return;
                }

                let voucherIdToUse;

                if (!currentVoucherId) {
                    const vouchersForAddress = await voucherIdOfActualPolkadotAccount();

                    if (vouchersForAddress.length === 0) {
                        voucherIdToUse = await createVoucherForCurrentPolkadotAccount();
                    } else {
                        voucherIdToUse = vouchersForAddress[0];

                        if (setCurrentVoucherId) setCurrentVoucherId(voucherIdToUse);

                        await manageVoucherId(voucherIdToUse);
                    }
                } else {
                    await manageVoucherId(currentVoucherId);
                    voucherIdToUse = currentVoucherId;
                }

                try {
                    await sendMessageWithVoucher(
                        account.decodedAddress,
                        voucherIdToUse,
                        account.meta.source,
                        CONTRACT.programId,
                        CONTRACT.metadata,
                        {
                            Ping: {
                                useAccount: [null, null]
                            }
                        },
                        0,
                        () => alert.success('Message send with voucher!'),
                        () => alert.error('Failed while sending message with voucher'),
                        () => alert.info('Message is in blocks'),
                        () => alert.info('Will send message')
                    );
                } catch (e) {
                    alert.error('Error while sending message');
                }
            }}>
                Send Ping with voucher
            </Button>
            <Button onClick={async () => {
                if (!account) {
                    alert.error("Accounts not ready!");
                    return;
                }

                let voucherIdToUse;
                
                if (!currentVoucherId) {
                    const vouchersForAddress = await voucherIdOfActualPolkadotAccount();

                    if (vouchersForAddress.length === 0) {
                        voucherIdToUse = await createVoucherForCurrentPolkadotAccount();
                    } else {
                        voucherIdToUse = vouchersForAddress[0];

                        if (setCurrentVoucherId) setCurrentVoucherId(voucherIdToUse);

                        await manageVoucherId(voucherIdToUse);
                    }
                } else {
                    await manageVoucherId(currentVoucherId);
                    voucherIdToUse = currentVoucherId;
                }

                try {
                    await sendMessageWithVoucher(
                        account.decodedAddress,
                        voucherIdToUse,
                        account.meta.source,
                        CONTRACT.programId,
                        CONTRACT.metadata,
                        {
                            Pong: {
                                useAccount: [null, null]
                            }
                        },
                        0,
                        () => alert.success('Message send with voucher!'),
                        () => alert.error('Failed while sending message with voucher'),
                        () => alert.info('Message is in blocks'),
                        () => alert.info('Will send message')
                    );
                } catch (e) {
                    alert.error('Error while sending message');
                }
            }}>
                Send Pong with voucher
            </Button>
        </div>
    )
}
