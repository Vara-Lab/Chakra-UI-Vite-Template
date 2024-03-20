import React from 'react';
import { Logo } from './logo';
import { AccountInfo } from './account-info';
import styles from './header.module.scss';

type Props = {
  isAccountVisible: boolean;
};

export function Header({ isAccountVisible }: Props) {
  const [isMenuOpen] = React.useState(false);

  return (
    <header className={styles.header}>
      <Logo />
      
      {isAccountVisible && <AccountInfo />}
    </header>
  );

  // return (
  //   <>
  //     <header className={styles.header}>
  //       <Container className={styles.header__container}>
  //         <Logo className={styles.header__logo} />
  //         <AccountInfo openWallet={openAndCloseChange} isOpen={isOpenChange} />
  //       </Container>
  //       {isOpenChange && (
  //         <Container>
  //           <WalletChange onClose={openAndCloseChange} openConnectWallet={openConnectWallet} />
  //         </Container>
  //       )}
  //     </header>

  //     <ModalBackground isOpen={isOpenChange} onClick={closeChange} />

  //     <AnimatePresence>{isOpenConnectWallet && <WalletConnect onClose={closConnectWallet} />}</AnimatePresence>
  //   </>
  // );
}
