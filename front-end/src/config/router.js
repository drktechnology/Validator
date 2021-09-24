// import LandingPage from '@/module/page/landing/Container'
import HomePage from '@/module/page/home/Container'
import GasStationPage from '@/module/page/gas_station/Container'
import FaucetPage from '@/module/page/faucet/Container'
import TestPage from '@/module/page/test/Container'
import NotFound from '@/module/page/error/NotFound'

export default [
  {
    path: '/',
    page: HomePage,
  },
  {
    path: '/home',
    page: HomePage,
  },
  {
    path: '/gas',
    page: GasStationPage,
  },
  {
    path: '/faucet',
    page: FaucetPage,
  },
  {
    path: '/test',
    page: TestPage,
  },
  {
    page: NotFound,
  },
]
