import React from 'react';
import { Button } from '@app/components/Buttons';
import ModalTemplate from '@app/components/ModalTemplate';
import Modal from '@app/components/Modal';
import i18n from '@app/lib/i18n';

const reloadPage = (forcedReload = true) => {
  // Reload the current page, without using the cache
  window.location.reload(forcedReload);
};

function ServerDisconnected(props) {
  return (
    <Modal
      size="xs"
      disableOverlayClick
      showCloseButton={false}
    >
      <Modal.Body>
        <ModalTemplate type="error">
          {({ PrimaryMessage, DescriptiveMessage }) => (
            <>
              <PrimaryMessage>
                {i18n._('Server has stopped working')}
              </PrimaryMessage>
              <DescriptiveMessage>
                {i18n._('A problem caused the server to stop working correctly. Check out the server status and try again.')}
              </DescriptiveMessage>
            </>
          )}
        </ModalTemplate>
      </Modal.Body>
      <Modal.Footer>
        <Button
          btnStyle="primary"
          onClick={reloadPage}
        >
          {i18n._('Reload')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ServerDisconnected;
