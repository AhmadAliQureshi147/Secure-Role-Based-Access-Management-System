
Nb = 4  # Number of columns (32-bit words) comprising the State. For AES, Nb = 4.
Nk = 8  # Number of 32-bit words comprising the Cipher Key. For AES-256, Nk = 8.
Nr = 14  # Number of rounds. For AES-256, Nr = 14.

# S-box transformation table
s_box = [
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
]



# Round constant word array, Rcon[i], contains the values given by x to the power (i-1)
r_con = [
    0x00000000,
    0x01000000,
    0x02000000,
    0x04000000,
    0x08000000,
    0x10000000,
    0x20000000,
    0x40000000,
    0x80000000,
    0x1b000000,
    0x36000000,
    0x6c000000,
    0xd8000000,
    0xab000000,
    0x4d000000,
    0x9a000000,
]

def sub_word(word):
    return ((s_box[(word >> 24) & 0xFF] << 24) |
            (s_box[(word >> 16) & 0xFF] << 16) |
            (s_box[(word >> 8) & 0xFF] << 8) |
            s_box[word & 0xFF])

def rot_word(word):
    return ((word << 8) & 0xFFFFFFFF) | (word >> 24)

def key_expansion(key):
    key_symbols = [ord(symbol) for symbol in key]
    key_schedule = [0] * Nb * (Nr + 1)
    
    for i in range(Nk):
        key_schedule[i] = (key_symbols[4 * i] << 24) | (key_symbols[4 * i + 1] << 16) | (key_symbols[4 * i + 2] << 8) | key_symbols[4 * i + 3]
    
    for i in range(Nk, Nb * (Nr + 1)):
        temp = key_schedule[i - 1]
        if i % Nk == 0:
            temp = sub_word(rot_word(temp)) ^ r_con[i // Nk]
        elif Nk > 6 and i % Nk == 4:
            temp = sub_word(temp)
        key_schedule[i] = key_schedule[i - Nk] ^ temp

    return key_schedule
    
def encrypt(plaintext, key):
    # Ensure the key is 256 bits (32 characters)
    if len(key) != 32:
        raise ValueError("Key must be 32 characters (256 bits) long.")

    key_schedule = key_expansion(key)
    encrypted_blocks = []

    # Process each 16-character block
    for block_start in range(0, len(plaintext), 16):
        block = plaintext[block_start:block_start + 16]

        # Pad block if necessary
        while len(block) < 16:
            block += '\x00'

        # Initial AddRoundKey step
        state = xor_with_plaintext(block, key_schedule)

        # 14 rounds of AES-256 encryption
        for round_num in range(1, Nr + 1):
            state = sub_bytes(state)
            state = shift_rows(state)
            if round_num != Nr:  # MixColumns is not applied in the final round
                state = mix_columns(state)
            state = add_round_key(state, key_schedule, round_num)

        encrypted_blocks.append(state)

    return encrypted_blocks



def xor_with_plaintext(plaintext, key_schedule):
    plaintext_bytes = [ord(char) for char in plaintext]
    while len(plaintext_bytes) < 16:
        plaintext_bytes.append(0)

    plaintext_words = [
        (plaintext_bytes[0] << 24) | (plaintext_bytes[1] << 16) | (plaintext_bytes[2] << 8) | plaintext_bytes[3],
        (plaintext_bytes[4] << 24) | (plaintext_bytes[5] << 16) | (plaintext_bytes[6] << 8) | plaintext_bytes[7],
        (plaintext_bytes[8] << 24) | (plaintext_bytes[9] << 16) | (plaintext_bytes[10] << 8) | plaintext_bytes[11],
        (plaintext_bytes[12] << 24) | (plaintext_bytes[13] << 16) | (plaintext_bytes[14] << 8) | plaintext_bytes[15]
    ]

    result = [plaintext_words[i] ^ key_schedule[i] for i in range(4)]
    return result

def sub_bytes(state):
    return [sub_word(state[i]) for i in range(4)]

def shift_rows(state):
    state_matrix = [
        [(state[i] >> (24 - 8 * j)) & 0xFF for j in range(4)]
        for i in range(4)
    ]

    for i in range(4):
        state_matrix[i] = state_matrix[i][(4-i):] + state_matrix[i][:(4-i)]

    shifted_state = [
        (state_matrix[i][0] << 24) | (state_matrix[i][1] << 16) |
        (state_matrix[i][2] << 8) | state_matrix[i][3]
        for i in range(4)
    ]

    return shifted_state



def xtime(a):
    return (((a << 1) ^ 0x1B) & 0xFF) if (a & 0x80) else (a << 1)

def mix_single_column(column):
    temp = column[0] ^ column[1] ^ column[2] ^ column[3]
    result = [
        column[0] ^ temp ^ xtime(column[0] ^ column[1]),
        column[1] ^ temp ^ xtime(column[1] ^ column[2]),
        column[2] ^ temp ^ xtime(column[2] ^ column[3]),
        column[3] ^ temp ^ xtime(column[3] ^ column[0])
    ]
    return result

def mix_columns(state):
    state_matrix = [
        [(state[i] >> (24 - 8 * j)) & 0xFF for j in range(4)]
        for i in range(4)
    ]

    for i in range(4):
        column = [state_matrix[j][i] for j in range(4)]
        mixed_column = mix_single_column(column)
        for j in range(4):
            state_matrix[j][i] = mixed_column[j]

    mixed_state = [
        (state_matrix[i][0] << 24) | (state_matrix[i][1] << 16) |
        (state_matrix[i][2] << 8) | state_matrix[i][3]
        for i in range(4)
    ]

    return mixed_state

def add_round_key(state, key_schedule, round_num):
    return [state[i] ^ key_schedule[round_num * Nb + i] for i in range(4)]
# Generate a random key of length 32 characters (256 bits)
import random
import string

def generate_random_string(length, charset):
    return ''.join(random.choice(charset) for _ in range(length))

# Character sets
lowercase_letters = string.ascii_lowercase
uppercase_letters = string.ascii_uppercase
digits = string.digits
symbols = string.punctuation

# Combine character sets as needed
charset = lowercase_letters + uppercase_letters + digits + symbols

# Specify the length of the random string
length = 32  # Key length

# Generate the random key
key = generate_random_string(length, charset)

print("Random Key:", key)


# User input

plaintext = input("Enter the plaintext : ")

# Ensure the key is 256 bits (32 characters)
if len(key) != 32:
    raise ValueError("Key must be 32 characters (256 bits) long.")

key_schedule = key_expansion(key)
    
encrypted_blocks = encrypt(plaintext, key)
print("\nEncrypted result:")
result = []
for block in encrypted_blocks:
    result.append(''.join(f"{byte:08x}" for byte in block))

print(''.join(result))




