import classnames from 'classnames'
import Router from 'next-translate/Router'
import useTranslation from 'next-translate/useTranslation'
import React, { Fragment, useEffect } from 'react'
import { FiLink2 } from 'react-icons/fi'
import Box from '~/components/Box'
import Button from '~/components/Button'
import Container from '~/components/Container'
import Copy from '~/components/Copy'
import Heading from '~/components/Heading'
import InputText from '~/components/InputText'
import Layout from '~/components/Layout'
import { Player } from '~/components/Players'
import useRoom from '~/hooks/useRoom'
import useRoomPlayers from '~/hooks/useRoomPlayers'
import scrollToTop from '~/utils/scrollToTop'

export default function Sala() {
  const [room] = useRoom()
  const { players = [] } = useRoomPlayers()
  const { t } = useTranslation()

  useEffect(scrollToTop, [])

  return (
    <Layout>
      <Container>
        <Box>
          <div className="mb-8">
            <Heading type="h2">{t('sala:title')}</Heading>
          </div>
          <div className="mb-8">
            <img
              src={require('~/public/virus/happy.png')}
              alt="coronavirus feliz"
              className="h-32 mx-auto"
            />
          </div>
          {room.name && (
            <InputText
              id="room-name"
              label={t('sala:room-name')}
              value={room.name || ''}
              readonly
              onFocus={event => event.target.select()}
            />
          )}
          {room.id && (
            <Fragment>
              <InputText
                hint={t('sala:field-link-hint')}
                id="url"
                label={t('sala:field-link')}
                value={`${window.location.host}/room/${room.id}`}
                readonly
                onFocus={event => event.target.select()}
              />
              <Copy content={`${window.location.host}/room/${room.id}`} />
            </Fragment>
          )}
          {room.videoCall && (
            <InputText
              id="videocall"
              label={t('sala:call-link')}
              readonly
              onFocus={event => event.target.select()}
              value={room.videoCall || ''}
            />
          )}
          {!room.readyToPlay ? (
            <div className="mt-8">
              <div className="italic text-gray-600 text-xs md:text-sm">
                {t('sala:not-ready')}
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <Heading type="h3" textCenter={false}>
                {t('sala:people', { count: players.length })}
              </Heading>
              <div className="italic -mt-6 text-gray-600 text-xs md:text-sm">
                <p className="my-8">{t('sala:list-description')}</p>
              </div>
              <div className="border-gray-300 border-t-2 mt-4 -mx-4">
                {players.length &&
                  players.map((player: Player, index: number) => (
                    <div
                      key={index}
                      className={classnames([
                        'border-b-2 border-gray-300 flex items-center justify-between px-4 py-2',
                        player.id === room.adminId
                          ? 'bg-green-100'
                          : index % 2 === 0
                          ? 'bg-gray-100'
                          : 'bg-gray-200',
                      ])}
                    >
                      <div className="flex flex-auto flex-wrap items-center">
                        <p>{player.name}</p>
                        {player.id === room.adminId && (
                          <span className="bg-green-200 border-2 border-green-300 font-medium ml-4 px-2 py-1 rounded text-xs">
                            {t('sala:is-admin')}
                          </span>
                        )}
                        <p className="italic mt-2 text-gray-600 text-sm w-full">
                          {t('common:board_plural', {
                            boardId: player.boards.split(',').join(' & '),
                          })}
                        </p>
                      </div>
                      <div className="ml-4">
                        <Button
                          id="play"
                          disabled={!room.readyToPlay}
                          onClick={() => {
                            Router.pushI18n(
                              `/room/[roomId]/[playerId]`,
                              `/room/${room.id}/${player.id}`,
                            )
                          }}
                        >
                          <FiLink2 />
                          <span className="ml-4">{t('sala:play')}</span>
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Box>
      </Container>
    </Layout>
  )
}
