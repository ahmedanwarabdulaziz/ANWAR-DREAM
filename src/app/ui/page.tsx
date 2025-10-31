'use client'

import { useState } from 'react'
import { 
  Button, 
  Card, 
  CardHeader, 
  CardContent, 
  CardActions, 
  Modal, 
  ModalHeader, 
  ModalContent, 
  ModalActions,
  Navbar,
  RewardTile,
  ListRow
} from '@/components/ui'

export default function UIPreview() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto max-w-6xl px-4 py-12">
        <div className="space-y-12">
          {/* Typography */}
          <section>
            <h2 className="text-h2 text-primary mb-6">Typography</h2>
            <div className="space-y-4">
              <h1 className="text-display text-h1">Display Heading</h1>
              <h2 className="text-h2">Section Heading</h2>
              <p className="text-body">Body text with proper line height and spacing.</p>
              <p className="text-caption">Caption text for secondary information.</p>
            </div>
          </section>

          {/* Buttons */}
          <section>
            <h2 className="text-h2 text-primary mb-6">Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </section>

          {/* Cards */}
          <section>
            <h2 className="text-h2 text-primary mb-6">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-h2 text-primary">Card Title</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-caption">This is a card with header, content, and actions.</p>
                </CardContent>
                <CardActions>
                  <Button variant="primary" size="sm">Action</Button>
                  <Button variant="ghost" size="sm">Cancel</Button>
                </CardActions>
              </Card>
              
              <Card>
                <CardContent>
                  <p className="text-caption">Simple card with just content.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Reward Tiles */}
          <section>
            <h2 className="text-h2 text-primary mb-6">Reward Tiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <RewardTile
                title="Premium Coffee"
                description="Artisanal coffee blend from local roastery"
                pointsRequired={2500}
                isAvailable={true}
              />
              <RewardTile
                title="Luxury Spa Treatment"
                description="60-minute full body massage and facial"
                pointsRequired={15000}
                isAvailable={false}
              />
              <RewardTile
                title="Gourmet Dinner"
                description="Three-course meal at partner restaurant"
                pointsRequired={8000}
                isAvailable={true}
              />
            </div>
          </section>

          {/* List Rows */}
          <section>
            <h2 className="text-h2 text-primary mb-6">List Rows</h2>
            <Card>
              <ListRow density="cozy">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Transaction #12345</h4>
                  <p className="text-caption">Earned 100 points</p>
                </div>
                <span className="text-success">+100</span>
              </ListRow>
              <ListRow density="cozy">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Transaction #12344</h4>
                  <p className="text-caption">Redeemed coffee</p>
                </div>
                <span className="text-error">-2500</span>
              </ListRow>
              <ListRow density="compact">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Transaction #12343</h4>
                  <p className="text-caption">Earned 50 points</p>
                </div>
                <span className="text-success">+50</span>
              </ListRow>
            </Card>
          </section>

          {/* Modal */}
          <section>
            <h2 className="text-h2 text-primary mb-6">Modal</h2>
            <Button onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <ModalHeader onClose={() => setIsModalOpen(false)}>
                Modal Title
              </ModalHeader>
              <ModalContent>
                <p className="text-body">
                  This is a modal dialog with proper focus management and backdrop blur.
                </p>
              </ModalContent>
              <ModalActions>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                  Confirm
                </Button>
              </ModalActions>
            </Modal>
          </section>
        </div>
      </main>
    </div>
  )
}







