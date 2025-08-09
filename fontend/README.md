# PSNChain Wallet Frontend

Modern, elegant, and professional wallet interface for PSNChain blockchain built with Next.js, React, and Tailwind CSS.

## ✨ Features

- **Modern Design**: Glassmorphism effects, smooth animations, and gradient backgrounds
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme**: Automatic theme switching with smooth transitions
- **Wallet Integration**: Connect and manage your PSNChain wallet
- **Token Management**: View balances, send tokens, and swap assets
- **Transaction History**: Track all your blockchain transactions
- **Real-time Updates**: Live balance updates and transaction status
- **Professional UI**: Clean, intuitive interface with modern typography

## 🚀 Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS 4.x
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)
- **Blockchain**: CosmJS for PSNChain integration

## 🎨 Design Features

### Visual Elements
- **Glassmorphism**: Translucent cards with backdrop blur effects
- **Gradient Backgrounds**: Beautiful color transitions
- **Smooth Animations**: Page transitions and micro-interactions
- **Modern Typography**: Inter font with optimized readability
- **Consistent Spacing**: 8px grid system for perfect alignment

### Color Palette
- **Primary**: Blue to Purple gradients
- **Success**: Green tones for positive actions
- **Warning**: Yellow/Orange for alerts
- **Error**: Red tones for errors
- **Neutral**: Gray scale for text and backgrounds

### Components
- **Header**: Sticky navigation with wallet connection
- **Balance Display**: Portfolio overview with hide/show functionality
- **Transfer Form**: Send tokens with validation and gas estimation
- **Swap Form**: Token exchange with real-time price estimation
- **Transaction History**: Animated transaction list with status indicators

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   NEXT_PUBLIC_CHAIN_ID=psnchain-1
   NEXT_PUBLIC_RPC_URL=https://rpc.psnchain.com
   NEXT_PUBLIC_REST_URL=https://api.psnchain.com
   NEXT_PUBLIC_FEE_DENOM=psn
   NEXT_PUBLIC_FEE_AMOUNT=5000
   NEXT_PUBLIC_GAS_LIMIT=200000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Connecting Wallet
1. Click "Connect Wallet" in the header
2. Approve the connection in your wallet extension
3. Your address and balance will be displayed

### Sending Tokens
1. Navigate to the Transfer section
2. Enter recipient address
3. Select token and amount
4. Review gas fees
5. Confirm transaction

### Swapping Tokens
1. Go to the Swap section
2. Select "From" and "To" tokens
3. Enter amount to swap
4. Review exchange rate and fees
5. Execute swap

### Viewing History
- All transactions are displayed in the History section
- Click "View" to see transaction details on explorer
- Refresh to get latest transactions

## 🎯 Performance Optimizations

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component for optimized loading
- **Font Optimization**: Preloaded Google Fonts
- **CSS Optimization**: Tailwind CSS purging for minimal bundle size
- **Animation Performance**: Hardware-accelerated animations with Framer Motion

## 🔧 Configuration

### Tailwind CSS
Custom configuration in `tailwind.config.js` includes:
- Custom color palette
- Extended spacing scale
- Animation utilities
- Responsive breakpoints

### Next.js
Configuration in `next.config.js` includes:
- Image domains
- Experimental features
- Build optimizations

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
vercel --prod
```

### Deploy to Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Platform
- Docker containers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

Built with ❤️ for the PSNChain ecosystem