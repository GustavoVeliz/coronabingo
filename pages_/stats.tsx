import classnames from 'classnames'
import React, { Fragment, ReactNode, useEffect, useState } from 'react'
import Box from '~/components/Box'
import Container from '~/components/Container'
import Heading from '~/components/Heading'
import Message from '~/components/Message'
import db from '~/utils/firebase'

interface Stats {
  roomsByDay: {
    [key: string]: number
  }
  roomsConfigured: number
  roomsOfFamilies: number
  roomsWithOnlineBingoSpinner: number
  roomsWithVideoCall: number
  sortedRoomsByDay: {
    date: string
    value: number
  }[]
  totalRooms: number
}

const defaultStats = {
  roomsByDay: {},
  roomsConfigured: 0,
  roomsOfFamilies: 0,
  roomsWithOnlineBingoSpinner: 0,
  roomsWithVideoCall: 0,
  sortedRoomsByDay: [],
  totalRooms: 0,
}
const pad = (n: number) => n.toString().padStart(2, '0')
const percentage = (amount: number, total: number) => {
  return (amount / total)
    .toFixed(2)
    .toString()
    .replace('.', ',')
}
const renderRow = (
  label: ReactNode,
  value: ReactNode,
  even: boolean,
  description: ReactNode,
  percentage: ReactNode,
) => {
  return (
    <div
      className={classnames([
        'border-b-2 border-gray-300 md:flex',
        even ? 'bg-gray-100' : 'bg-white',
      ])}
    >
      <div className="flex-auto px-4 py-2">
        <p>{label}</p>
        <p className="text-gray-600 text-xs md:text-sm">{description}</p>
      </div>
      <div className="border-gray-300 flex items-center justify-between md:border-l-2 px-4 py-2 md:w-64">
        <p className="font-medium text-md md:text-lg">{value}</p>
        <p className="text-gray-600 text-xs md:text-sm">{percentage}</p>
      </div>
    </div>
  )
}
const transformRoomsByDay = (obj: Record<string, number>) =>
  Object.keys(obj)
    .map(k => ({
      date: k,
      value: obj[k],
    }))
    .sort((r1, r2) => r2.value - r1.value)
    .slice(0, 10)
const weekdays = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]

export default function Index() {
  const [stats, setStats] = useState<Stats | undefined>()

  useEffect(() => {
    const getMarker = async () => {
      const roomsCollection = await db.collection('rooms').get()
      const rooms = roomsCollection.docs.map(r => r.data())

      console.log('// ROOMS')
      console.log(rooms)
      console.log('// =========================')

      const data = rooms.reduce<Stats>(
        (prev: Stats, curr: firebase.firestore.DocumentData) => {
          prev.totalRooms++

          if ('readyToPlay' in curr && curr.readyToPlay) {
            prev.roomsConfigured++

            const date = curr.date.toDate()
            const dateKey =
              [
                pad(date.getDate()),
                pad(date.getMonth() + 1),
                pad(date.getFullYear()),
              ].join('/') +
              ', ' +
              weekdays[date.getDay()]

            prev.roomsByDay[dateKey] = (prev.roomsByDay[dateKey] || 0) + 1

            if (
              curr.name.toUpperCase().includes('flia'.toUpperCase()) ||
              curr.name.toUpperCase().includes('familia'.toUpperCase())
            ) {
              prev.roomsOfFamilies++
            }

            if (curr.bingoSpinner || curr.turningGlob) {
              prev.roomsWithOnlineBingoSpinner++
            }

            if (curr.videoCall) {
              prev.roomsWithVideoCall++
            }
          }

          return prev
        },
        defaultStats,
      )

      data.sortedRoomsByDay = transformRoomsByDay(data.roomsByDay)

      console.log('// DATA')
      console.log(data)
      console.log('// =========================')

      setStats(data)
    }

    getMarker()
  }, [])

  return (
    <main className="bg-gray-200 leading-normal min-h-screen px-4 py-8 text-gray-900 text-sm md:text-base">
      <Container size="large">
        <Box>
          <Heading type="h1">Estadísticas</Heading>
          {!stats && (
            <div className="mt-8">
              <Message type="information">Obteniendo información...</Message>
            </div>
          )}
          {stats && (
            <Fragment>
              <div className="mt-8">
                <Heading type="h2" textCenter={false}>
                  Sobre las salas
                </Heading>
              </div>
              <div className="border-gray-300 border-l-2 border-r-2 border-t-2 flex flex-col mt-8 rounded">
                {renderRow(
                  'Creadas',
                  stats.totalRooms,
                  false,
                  'No necesariamente llegaron a jugarse',
                  '',
                )}
                {renderRow(
                  'No configuradas',
                  stats.totalRooms - stats.roomsConfigured,
                  true,
                  'No se presionó "Jugar" en el admin',
                  percentage(
                    (stats.totalRooms - stats.roomsConfigured) * 100,
                    stats.totalRooms,
                  ) + '%',
                )}
                {renderRow(
                  'Configuradas',
                  stats.roomsConfigured,
                  false,
                  'Se presionó "Jugar" en el admin al menos 1 vez',
                  percentage(stats.roomsConfigured * 100, stats.totalRooms) +
                    '%',
                )}
                {renderRow(
                  'Configuradas que usaron el bolillero online',
                  stats.roomsWithOnlineBingoSpinner,
                  true,
                  '',
                  percentage(
                    stats.roomsWithOnlineBingoSpinner * 100,
                    stats.roomsConfigured,
                  ) + '%',
                )}
                {renderRow(
                  'Configuradas que usaron el campo "Link a la videollamada"',
                  stats.roomsWithVideoCall,
                  false,
                  '',
                  percentage(
                    stats.roomsWithVideoCall * 100,
                    stats.roomsConfigured,
                  ) + '%',
                )}
                {renderRow(
                  'Configuradas que jugaron familias',
                  stats.roomsOfFamilies,
                  true,
                  'El nombre de la sala contiene "familia" o "flia"',
                  percentage(
                    stats.roomsOfFamilies * 100,
                    stats.roomsConfigured,
                  ) + '%',
                )}
              </div>
              <div className="mt-8">
                <Heading type="h2" textCenter={false}>
                  Los 10 días donde se configuraron más salas
                </Heading>
              </div>
              <div className="border-gray-300 border-l-2 border-r-2 border-t-2 flex flex-col mt-8 rounded">
                {stats.sortedRoomsByDay.map(({ date, value }, i) => (
                  <Fragment key={date}>
                    {renderRow(
                      date.split(',')[0],
                      value,
                      i % 2 !== 0,
                      date.split(',')[1],
                      '',
                    )}
                  </Fragment>
                ))}
              </div>
            </Fragment>
          )}
        </Box>
      </Container>
    </main>
  )
}
