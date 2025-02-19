import React, { useContext, useState } from 'react'
// @ts-ignore
import { Button, Dialog, Scrim, CircularProgress } from '@equinor/eds-core-react'

import { SyncAPI } from '../Api'
import styled from 'styled-components'
import { ErrorToast } from './Common/Toast'
import { AuthContext } from '../Context'
import Icon from '../Icons'

const { Actions, Title, CustomContent } = Dialog

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`

export const RefreshButton = () => {
  const [scrim, setScrim] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const apiToken: string = useContext(AuthContext)?.token

  const syncSharePoint = () => {
    SyncAPI.postSyncApi(apiToken)
      .then(() => {
        setLoading(false)
        window.location.reload()
      })
      .catch(error => {
        ErrorToast(`${error.response.data}`, error.response.status)
        console.error('fetch error' + error)
        setLoading(false)
      })
  }

  return (
    <>
      <Button variant='outlined' onClick={() => setScrim(true)}>
        <Icon name='refresh' title='refresh' />
        Synchronize with SharePoint
      </Button>
      {scrim && (
        <Scrim onClose={() => setScrim(false)}>
          <Dialog style={{ width: 'min-content' }}>
            <Title>Synchronize SharePoint data</Title>
            <CustomContent style={{ display: 'flex', flexFlow: 'column', alignItems: 'center' }}>
              <p>
                This will synchronize products distribution and products metadata from SharePoint (
                <a href='https://statoilsrm.sharepoint.com/sites/LCMTeamBlend'>
                  https://statoilsrm.sharepoint.com/sites/LCMTeamBlend
                </a>
                )
              </p>
              <p>
                The sync job will take approximately 1 minute, and the LCM App will be <b>unavailable</b> during this
                time.
              </p>
              {loading && <CircularProgress />}
            </CustomContent>
            <Actions style={{ width: 'fill-available', display: 'flex', justifySelf: 'normal' }}>
              <ButtonWrapper>
                <Button onClick={() => setScrim(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  color='danger'
                  disabled={loading}
                  onClick={() => {
                    setLoading(true)
                    syncSharePoint()
                  }}>
                  Sync Now
                </Button>
              </ButtonWrapper>
            </Actions>
          </Dialog>
        </Scrim>
      )}
    </>
  )
}

export default RefreshButton
