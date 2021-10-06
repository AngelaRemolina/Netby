import socket
import struct

# Returns MAC as string from bytes (ie AA:BB:CC:DD:EE:FF)
def get_mac_addr(mac_raw):
    byte_str = map('{:02x}'.format, mac_raw) # if mac_raw= [1,15,255,...] it gets converted to 01:FF:FF...
    mac_addr = ':'.join(byte_str).upper()
    return mac_addr

class Ethernet:

    def __init__(self, raw_data):

        dest, src, prototype = struct.unpack('! 6s 6s H', raw_data[:14]) 
        # convert from big-endian to little-endian (s = 6 bytes, H = small unsigned int). We take the first 14 bytes of data
        self.dest_mac = get_mac_addr(dest)
        self.src_mac = get_mac_addr(src)
        self.proto = socket.htons(prototype)
        self.data = raw_data[14:]
    
   


