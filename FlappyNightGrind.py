import pygame, random, time
from pygame.locals import *
import mysql.connector

# VARIABLES
SCREEN_WIDHT = 400
SCREEN_HEIGHT = 600
SPEED = 20
GRAVITY = 2.5
GAME_SPEED = 15

GROUND_WIDHT = 2 * SCREEN_WIDHT
GROUND_HEIGHT = 100

PIPE_WIDHT = 80
PIPE_HEIGHT = 500

PIPE_GAP = 150

wing = 'assets/audio/wing.wav'
hit = 'assets/audio/hit.wav'

pygame.mixer.init()

# Initialize font
pygame.font.init()
font = pygame.font.SysFont(None, 50)

class Bird(pygame.sprite.Sprite):
    def __init__(self):
        pygame.sprite.Sprite.__init__(self)

        self.images = [pygame.image.load('assets/sprites/bluebird-upflap.png').convert_alpha(),
                       pygame.image.load('assets/sprites/bluebird-midflap.png').convert_alpha(),
                       pygame.image.load('assets/sprites/bluebird-downflap.png').convert_alpha()]

        self.speed = SPEED

        self.current_image = 0
        self.image = pygame.image.load('assets/sprites/bluebird-upflap.png').convert_alpha()
        self.mask = pygame.mask.from_surface(self.image)

        self.rect = self.image.get_rect()
        self.rect[0] = SCREEN_WIDHT / 6
        self.rect[1] = SCREEN_HEIGHT / 2

    def update(self):
        self.current_image = (self.current_image + 1) % 3
        self.image = self.images[self.current_image]
        self.speed += GRAVITY

        # UPDATE HEIGHT
        self.rect[1] += self.speed

    def bump(self):
        self.speed = -SPEED

    def begin(self):
        self.current_image = (self.current_image + 1) % 3
        self.image = self.images[self.current_image]


class Pipe(pygame.sprite.Sprite):
    def __init__(self, inverted, xpos, ysize):
        pygame.sprite.Sprite.__init__(self)

        self.image = pygame.image.load('assets/sprites/pipe-green.png').convert_alpha()
        self.image = pygame.transform.scale(self.image, (PIPE_WIDHT, PIPE_HEIGHT))

        self.rect = self.image.get_rect()
        self.rect[0] = xpos

        if inverted:
            self.image = pygame.transform.flip(self.image, False, True)
            self.rect[1] = - (self.rect[3] - ysize)
        else:
            self.rect[1] = SCREEN_HEIGHT - ysize

        self.mask = pygame.mask.from_surface(self.image)

    def update(self):
        self.rect[0] -= GAME_SPEED


class Ground(pygame.sprite.Sprite):
    def __init__(self, xpos):
        pygame.sprite.Sprite.__init__(self)
        self.image = pygame.image.load('assets/sprites/base.png').convert_alpha()
        self.image = pygame.transform.scale(self.image, (GROUND_WIDHT, GROUND_HEIGHT))

        self.mask = pygame.mask.from_surface(self.image)

        self.rect = self.image.get_rect()
        self.rect[0] = xpos
        self.rect[1] = SCREEN_HEIGHT - GROUND_HEIGHT

    def update(self):
        self.rect[0] -= GAME_SPEED


def is_off_screen(sprite):
    return sprite.rect[0] < -(sprite.rect[2])

def get_random_pipes(xpos):
    size = random.randint(100, 300)
    pipe = Pipe(False, xpos, size)
    pipe_inverted = Pipe(True, xpos, SCREEN_HEIGHT - size - PIPE_GAP)
    return pipe, pipe_inverted

def start_screen():
    screen.blit(BACKGROUND, (0, 0))
    screen.blit(BEGIN_IMAGE, (120, 150))
    pygame.display.update()

    waiting = True
    while waiting:
        for event in pygame.event.get():
            if event.type == QUIT:
                pygame.quit()
                quit()
            if event.type == KEYDOWN and (event.key == K_SPACE or event.key == K_UP):
                waiting = False  # Exit the loop to start the game

def game_over_screen():
    screen.fill((0, 0, 0))  # Fill screen with black
    game_over_text = font.render("Game Over", True, (255, 0, 0))
    restart_text = font.render("Press R to Restart", True, (255, 255, 255))

    # Center texts on screen
    screen.blit(game_over_text, (SCREEN_WIDHT / 2 - game_over_text.get_width() / 2, SCREEN_HEIGHT / 3))
    screen.blit(restart_text, (SCREEN_WIDHT / 2 - restart_text.get_width() / 2, SCREEN_HEIGHT / 2))

    pygame.display.update()

    # Wait for restart input
    waiting = True
    while waiting:
        for event in pygame.event.get():
            if event.type == QUIT:
                pygame.quit()
                quit()
            if event.type == KEYDOWN and event.key == K_r:
                waiting = False  # Exit loop to restart game
                
                
def save_score(points):
    # Connect to the MySQL database
    conn = mysql.connector.connect(
        host="your_host",       # Replace with your MySQL host, e.g., "localhost" or an IP address
        user="your_username",   # Replace with your MySQL username
        password="your_password", # Replace with your MySQL password
        database="game_db"      # The database you created for your game
    )
    
    cursor = conn.cursor()
    
    # Insert the points into the scores table
    cursor.execute('INSERT INTO scores (points) VALUES (%s)', (points,))
    
    # Commit the transaction and close the connection
    conn.commit()
    cursor.close()
    conn.close()

# Initialize game elements
pygame.init()
screen = pygame.display.set_mode((SCREEN_WIDHT, SCREEN_HEIGHT))
pygame.display.set_caption('Flappy Bird')

BACKGROUND = pygame.image.load('assets/sprites/background-day.png')
BACKGROUND = pygame.transform.scale(BACKGROUND, (SCREEN_WIDHT, SCREEN_HEIGHT))
BEGIN_IMAGE = pygame.image.load('assets/sprites/message.png').convert_alpha()

clock = pygame.time.Clock()

# Main Game Function
def main_game():
    bird_group = pygame.sprite.Group()
    bird = Bird()
    bird_group.add(bird)

    ground_group = pygame.sprite.Group()
    for i in range(2):
        ground = Ground(GROUND_WIDHT * i)
        ground_group.add(ground)

    pipe_group = pygame.sprite.Group()
    for i in range(2):
        pipes = get_random_pipes(SCREEN_WIDHT * i + 800)
        pipe_group.add(pipes[0])
        pipe_group.add(pipes[1])

    points = 0
    running = True

    # Display Start Screen
    start_screen()

    # Main game loop
    while running:
        clock.tick(15)

        for event in pygame.event.get():
            if event.type == QUIT:
                pygame.quit()
                quit()
            if event.type == KEYDOWN:
                if event.key == K_SPACE or event.key == K_UP:
                    bird.bump()
                    pygame.mixer.music.load(wing)
                    pygame.mixer.music.play()

        screen.blit(BACKGROUND, (0, 0))

        if is_off_screen(ground_group.sprites()[0]):
            ground_group.remove(ground_group.sprites()[0])
            new_ground = Ground(GROUND_WIDHT - 20)
            ground_group.add(new_ground)

        if is_off_screen(pipe_group.sprites()[0]):
            pipe_group.remove(pipe_group.sprites()[0])
            pipe_group.remove(pipe_group.sprites()[0])
            pipes = get_random_pipes(SCREEN_WIDHT * 2)
            pipe_group.add(pipes[0])
            pipe_group.add(pipes[1])
            points += 1  # Increase points when the bird passes a set of pipes

        bird_group.update()
        ground_group.update()
        pipe_group.update()

        bird_group.draw(screen)
        pipe_group.draw(screen)
        ground_group.draw(screen)

        # Display points
        points_text = font.render(str(points), True, (255, 255, 255))
        screen.blit(points_text, (SCREEN_WIDHT / 2 - points_text.get_width() / 2, 50))

        pygame.display.update()

        # Check for collisions
        if (pygame.sprite.groupcollide(bird_group, ground_group, False, False, pygame.sprite.collide_mask) or
                pygame.sprite.groupcollide(bird_group, pipe_group, False, False, pygame.sprite.collide_mask)):
            pygame.mixer.music.load(hit)
            pygame.mixer.music.play()
            time.sleep(1)
            running = False  # End game loop
    save_score(points)
    game_over_screen()  # Show Game Over screen
    main_game()         # Restart the game when player chooses to restart

# Start the game
main_game()
