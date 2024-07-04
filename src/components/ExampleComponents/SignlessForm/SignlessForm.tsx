import { useState, useContext, useEffect } from 'react'
import { dAppContext } from '@/Context/dappContext'
import { 
    useContractUtils,
    useVoucherUtils,
    useSignlessUtils
} from '@/app/hooks';
import { 
    sponsorName, 
    sponsorMnemonic 
} from '@/app/consts'; 
import { useForm } from 'react-hook-form'
import { Input, Button, Modal } from '@gear-js/vara-ui';
import { useAccount, useAlert } from '@gear-js/react-hooks';
import { CONTRACT } from '@/app/consts';
import CryptoJs from 'crypto-js';

import './SignlessForm.css';
import { decodeAddress } from '@gear-js/api';

interface Props {
    closeForm: any
}

interface FormDefaultValuesI {
    accountName: string,
    password: string
}

const DEFAULT_VALUES: FormDefaultValuesI = {
    accountName: '',
    password: ''
};

export const SignlessForm = ({ closeForm }: Props) => {
    const { account } = useAccount();
    const alert = useAlert();
    const { register, handleSubmit, formState } = useForm({ defaultValues: DEFAULT_VALUES });
    const { errors } = formState;
    const {
        setSignlessAccount,
        setCurrentVoucherId,
        setNoWalletSignlessAccountName
    } = useContext(dAppContext);
    const {
        sendMessageWithSignlessAccount,
        readState
    } = useContractUtils();
    const {
        createNewPairAddress,
        lockPair,
        unlockPair,
        modifyPairToContract,
        formatContractSignlessData
    } = useSignlessUtils();
    const {
        generateNewVoucher,
        checkVoucherForUpdates,
        vouchersInContract
    } = useVoucherUtils(sponsorName, sponsorMnemonic);

    
    const [userHasWallet, setUserHasWallet] = useState(false);
    const [sectionConfirmCreationOfSignlessAccountIsOpen, setsectionConfirmCreationOfSignlessAccountIsOpen] = useState(false);
    const [noWalletAccountData, setNoWalletAccountData] = useState<FormDefaultValuesI>({ 
        accountName: '', 
        password: '',
    });

    useEffect(() => {
        if (!account) {
            setUserHasWallet(false);
        } else {
            setUserHasWallet(true);
        }
    }, [account]);


    const handleConfirmData = async () => {
        const encryptedName = CryptoJs.SHA256(noWalletAccountData.accountName).toString();

        const newSignlessAccount = await createNewPairAddress();
        const lockedSignlessAccount = lockPair(
            newSignlessAccount, 
            noWalletAccountData.password
        );

        const formatedLockedSignlessAccount = modifyPairToContract(lockedSignlessAccount);

        let signlessVoucherId;

        try {
            signlessVoucherId = await generateNewVoucher(
                [CONTRACT.programId],
                decodeAddress(newSignlessAccount.address),
                2, // initial tokens
                30, // 30 blocks (one minute)
                () => alert.success('Voucher created for signless account!'),
                () => alert.error('Error while issuw voucher to signless account'),
                () => alert.info('Issue voucher to signless account...')
            );

            if (setCurrentVoucherId) setCurrentVoucherId(signlessVoucherId);
        } catch(e) {
            alert.error('Error while issue a voucher to a singless account!');
            return;
        }

        try {
            await sendMessageWithSignlessAccount(
                newSignlessAccount,
                CONTRACT.programId,
                signlessVoucherId,
                CONTRACT.metadata,
                {
                    BindSignlessAccountWithNoWallet: {
                        noWallet: encryptedName,
                        signlessData: formatedLockedSignlessAccount
                    }
                },
                0,
                () => alert.success('Signless account send!'),
                () => alert.error('Error while sending signless account'),
                () => alert.info('Message in block!'),
                () => alert.info('Will send a message')
            );
        } catch(e) {
            alert.error('Error while sending signless account');
            return;
        }

        if (setSignlessAccount) setSignlessAccount(newSignlessAccount);
        if (setCurrentVoucherId) setCurrentVoucherId(signlessVoucherId);
        if (setNoWalletSignlessAccountName) setNoWalletSignlessAccountName(encryptedName);

        closeForm();
    };

    const handleSubmitPassword = async ({ password }: FormDefaultValuesI) => {
        if (!account) {
            alert.error('Account is not ready');
            return;
        }

        const contractState: any = await readState(
            CONTRACT.programId,
            CONTRACT.metadata,
            {
                SignlessAddressByAddress: account.decodedAddress
            }
        );

        const { signlessAddress } = contractState;

        if (signlessAddress) {
            const contractState: any = await readState(
                CONTRACT.programId,
                CONTRACT.metadata,
                {
                    SignlessData: signlessAddress
                }
            );

            const { signlessData } = contractState;

            let signlessDataFromContract;

            try {
                const lockedSignlessData = formatContractSignlessData(signlessData);
                signlessDataFromContract = unlockPair(lockedSignlessData, password);
            } catch(e) {
                alert.error('Incorrect password for signless account!');
                return;
            }

            const vouchersId = await vouchersInContract(
                CONTRACT.programId,
                decodeAddress(signlessDataFromContract.address)
            );

            try {
                await checkVoucherForUpdates(
                    decodeAddress(signlessDataFromContract.address),
                    vouchersId[0],
                    1,
                    1_200,
                    2,
                    () => alert.success('Voucher updates'),
                    () => alert.error('Error while updating voucher'),
                    () => alert.info('Check voucher for updates...')
                );
            } catch(e) {
                alert.error('Error while updating signless account voucher');
                return;
            } 

            if (setSignlessAccount) setSignlessAccount(signlessDataFromContract);
            if (setCurrentVoucherId) setCurrentVoucherId(vouchersId[0]);

            closeForm();
            return;
        }


        // Signless account does not exists

        const newSignlessAccount = await createNewPairAddress();

        const lockedSignlessAccount = lockPair(
            newSignlessAccount, 
            noWalletAccountData.password
        );

        const formatedLockedSignlessAccount = modifyPairToContract(lockedSignlessAccount);

        let signlessVoucherId;

        try {
            signlessVoucherId = await generateNewVoucher(
                [CONTRACT.programId],
                decodeAddress(newSignlessAccount.address),
                2, // initial tokens
                30, // 30 blocks (one minute)
                () => alert.success('Voucher created for signless account!'),
                () => alert.error('Error while issuw voucher to signless account'),
                () => alert.info('Issue voucher to signless account...')
            );

            if (setCurrentVoucherId) setCurrentVoucherId(signlessVoucherId);
        } catch(e) {
            alert.error('Error while issue a voucher to a singless account!');
            return;
        }

        try {
            await sendMessageWithSignlessAccount(
                newSignlessAccount,
                CONTRACT.programId,
                signlessVoucherId,
                CONTRACT.metadata,
                {
                    BindSignlessAccountWithAddress: {
                        userAddress: account.decodedAddress,
                        signlessData: formatedLockedSignlessAccount
                    }
                },
                0,
                () => alert.success('Signless account send!'),
                () => alert.error('Error while sending signless account'),
                () => alert.info('Message in block!'),
                () => alert.info('Will send a message')
            );
        } catch(e) {
            alert.error('Error while sending signless account');
            return;
        }

        if (setSignlessAccount) setSignlessAccount(newSignlessAccount);
        if (setCurrentVoucherId) setCurrentVoucherId(signlessVoucherId);

        closeForm();

    }

    const handleSubmitNoWalletSignless = async ({accountName, password}: FormDefaultValuesI) => {
        const encryptedName = CryptoJs.SHA256(accountName).toString();

        let contractState: any = await readState(
            CONTRACT.programId,
            CONTRACT.metadata,
            {
                SignlessAddressByNoWallet: encryptedName
            }
        );

        const { signlessAddress } = contractState;

        if (!signlessAddress) {
            setsectionConfirmCreationOfSignlessAccountIsOpen(true);
            return;
        }

        contractState = await readState(
            CONTRACT.programId,
            CONTRACT.metadata,
            {
                SignlessData: signlessAddress
            }
        );

        const { signlessData } = contractState;

        let signlessDataFromContract;

        try {
            const lockedSignlessData = formatContractSignlessData(signlessData);
            signlessDataFromContract = unlockPair(lockedSignlessData, password);
        } catch(e) {
            alert.error('Incorrect password for signless account!');
            return;
        }

        const vouchersId = await vouchersInContract(
            CONTRACT.programId,
            decodeAddress(signlessDataFromContract.address)
        );

        try {
            await checkVoucherForUpdates(
                decodeAddress(signlessDataFromContract.address),
                vouchersId[0],
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

        if (setSignlessAccount) setSignlessAccount(signlessDataFromContract);
        if (setCurrentVoucherId) setCurrentVoucherId(vouchersId[0]);
        if (setNoWalletSignlessAccountName) setNoWalletSignlessAccountName(encryptedName);

        closeForm();
    };

    return (
        <Modal
            heading='Signless Form'
            close={closeForm}
        >
             <div className='signless-form'>
                {/* <h2 className='signless-form__title'>
                    Signless Form
                </h2> */}
                {
                    userHasWallet ? (
                        <form onSubmit={handleSubmit(handleSubmitPassword)} className='signless-form--form'>
                            <Input 
                                className='signless-form__input'
                                type='password'
                                label='Set password'
                                error={errors.password?.message}
                                {
                                    ...register(
                                        'password',
                                        {
                                            required: 'Field is required',
                                            minLength: {
                                                value: 10,
                                                message: 'Minimum length is 10'
                                            }
                                        }
                                    )
                                }
                            />
                            <Button
                                className='signless-form__button'
                                type='submit'
                                block={true}
                            >
                                Submit
                            </Button>
                            {
                                !sectionConfirmCreationOfSignlessAccountIsOpen &&  <Button
                                    className='signless-form__button'
                                    color='light'
                                    block={true}
                                    onClick={closeForm}
                                >
                                    Cancel
                                </Button>
                            }
                        </form>
                    ) : (
                        <form 
                            onSubmit={
                                handleSubmit(
                                    !sectionConfirmCreationOfSignlessAccountIsOpen
                                    ? handleSubmitNoWalletSignless
                                    : handleConfirmData
                                )
                            } 
                            className='signless-form--form'
                        >
                            {
                                !sectionConfirmCreationOfSignlessAccountIsOpen && <>
                                    <Input 
                                        className='signless-form__input'
                                        type='account name'
                                        label='Set name'
                                        error={errors.password?.message}
                                        {
                                            ...register(
                                                'accountName',
                                                {
                                                    required: 'Field is required',
                                                    minLength: {
                                                        value: 10,
                                                        message: 'Minimum length is 10'
                                                    }
                                                }
                                            )
                                        }
                                        onChange={(e) => {
                                            setNoWalletAccountData({
                                                ...noWalletAccountData,
                                                accountName: e.target.value
                                            });
                                        }}
                                        value={noWalletAccountData.accountName}
                                    />
                                    <Input 
                                        className='signless-form__input'
                                        type='password'
                                        label='Set password'
                                        error={errors.password?.message}
                                        {
                                            ...register(
                                                'password',
                                                {
                                                    required: 'Field is required',
                                                    minLength: {
                                                        value: 10,
                                                        message: 'Minimum length is 10'
                                                    }
                                                }
                                            )
                                        }
                                        onChange={(e) => {
                                            setNoWalletAccountData({
                                                ...noWalletAccountData,
                                                password: e.target.value
                                            });
                                        }}
                                        value={noWalletAccountData.password}
                                    />
                                </>
                            }

                            {
                                sectionConfirmCreationOfSignlessAccountIsOpen &&
                                <p 
                                    style={{
                                        width: '280px',
                                        textAlign: 'center',
                                        marginBottom: '10px'
                                    }}
                                >
                                    The account does not have a signless account, do you want to create one?
                                </p>
                            }
                            
                            <Button 
                                className='signless-form__button'
                                type='submit'
                                block={true}
                            >
                                {
                                    !sectionConfirmCreationOfSignlessAccountIsOpen
                                    ? 'Submit'
                                    : "Create"
                                }
                            </Button>

                            {
                                sectionConfirmCreationOfSignlessAccountIsOpen &&  <Button
                                    className='signless-form__button'
                                    color='grey'
                                    block={true}
                                    onClick={() => setsectionConfirmCreationOfSignlessAccountIsOpen(false)}
                                >
                                    Cancel
                                </Button>
                            }
                            {
                                !sectionConfirmCreationOfSignlessAccountIsOpen &&  <Button
                                    className='signless-form__button'
                                    color='grey'
                                    block={true}
                                    onClick={closeForm}
                                >
                                    Cancel
                                </Button>
                            }
                        </form>
                    )
                }   
            </div>
        </Modal>
       
    );
}
