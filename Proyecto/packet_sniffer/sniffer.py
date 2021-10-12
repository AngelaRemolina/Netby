import socket
import textwrap
import time
import json
from networking.ethernet import Ethernet
from networking.ipv4 import IPv4
from networking.icmp import ICMP
from networking.tcp import TCP
from networking.udp import UDP
from networking.pcap import Pcap
from networking.http import HTTP

TAB_1 = '\t - '
TAB_2 = '\t\t - '
TAB_3 = '\t\t\t - '
TAB_4 = '\t\t\t\t - '

DATA_TAB_1 = '\t   '
DATA_TAB_2 = '\t\t   '
DATA_TAB_3 = '\t\t\t   '
DATA_TAB_4 = '\t\t\t\t   '


def main(capture_timeout):
    capture = []
    pcap = Pcap('capture.pcap')
    conn = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.ntohs(3))

    timeout = time.time() + capture_timeout
    cont = 0
    while True:
        cont = cont + 1
        if (time.time() > timeout):
            break

        raw_data, addr = conn.recvfrom(65535)
        pcap.write(raw_data)
        eth = Ethernet(raw_data)

        #print('\nEthernet Frame:')
        #print(TAB_1 + 'Destination: {}, Source: {}, Protocol: {}'.format(eth.dest_mac, eth.src_mac, eth.proto))
        inner_dict = {'Description':'Destination: {}, Source: {}, Protocol: {}'.format(eth.dest_mac, eth.src_mac, eth.proto)}

        # IPv4
        if eth.proto == 8:
            ipv4 = IPv4(eth.data)
            #print(TAB_1 + 'IPv4 Packet:')
            #print(TAB_2 + 'Version: {}, Header Length: {}, TTL: {},'.format(ipv4.version, ipv4.header_length, ipv4.ttl))
            #print(TAB_2 + 'Protocol: {}, Source: {}, Target: {}'.format(ipv4.proto, ipv4.src, ipv4.target))

            inner_dict['IPv4 Packet'] = 'Version: {}, Header Length: {}, TTL: {}, Protocol: {}, Source: {}, Target: {}'.format(ipv4.version, ipv4.header_length, ipv4.ttl,ipv4.proto, ipv4.src, ipv4.target)

            # ICMP
            if ipv4.proto == 1:
                icmp = ICMP(ipv4.data)
                #print(TAB_1 + 'ICMP Packet:')
                #print(TAB_2 + 'Type: {}, Code: {}, Checksum: {},'.format(icmp.type, icmp.code, icmp.checksum))
                #print(TAB_2 + 'ICMP Data:')
                #print(format_multi_line(DATA_TAB_3, icmp.data))

                inner_dict['ICMP Packet'] = 'Type: {}, Code: {}, Checksum: {},'.format(icmp.type, icmp.code, icmp.checksum)
                inner_dict['ICMP Data'] = format_multi_line(icmp.data)

            # TCP
            elif ipv4.proto == 6:
                tcp = TCP(ipv4.data)
                #print(TAB_1 + 'TCP Segment:')
                #print(TAB_2 + 'Source Port: {}, Destination Port: {}'.format(tcp.src_port, tcp.dest_port))
                #print(TAB_2 + 'Sequence: {}, Acknowledgment: {}'.format(tcp.sequence, tcp.acknowledgment))
                #print(TAB_2 + 'Flags:')
                #print(TAB_3 + 'URG: {}, ACK: {}, PSH: {}'.format(tcp.flag_urg, tcp.flag_ack, tcp.flag_psh))
                #print(TAB_3 + 'RST: {}, SYN: {}, FIN:{}'.format(tcp.flag_rst, tcp.flag_syn, tcp.flag_fin))

                inner_dict['TCP Segment'] = f'Source Port: {tcp.src_port}, Destination Port: {tcp.dest_port}, Sequence: {tcp.sequence}, Acknowledgment: {tcp.acknowledgment}'
                inner_dict['TCP flags'] = f'URG: {tcp.flag_urg}, ACK: {tcp.flag_ack}, PSH: {tcp.flag_psh}, RST: {tcp.flag_rst}, SYN: {tcp.flag_syn}, FIN:{tcp.flag_fin}'

                if len(tcp.data) > 0:

                    # HTTP
                    if tcp.src_port == 80 or tcp.dest_port == 80:
                        #print(TAB_2 + 'HTTP Data:')
                        try:
                            http = HTTP(tcp.data)
                            http_info = str(http.data).split('\n')
                            http_data = ''
                            for line in http_info:
                                #print(DATA_TAB_3 + str(line))
                                http_data += str(line)+","
                            inner_dict['HTTP Data'] = http_info
                        except:
                            #print(format_multi_line(DATA_TAB_3, tcp.data))
                            inner_dict['HTTP Data'] = format_multi_line(DATA_TAB_3, tcp.data)
                    else:
                        #print(TAB_2 + 'TCP Data:')
                        #print(format_multi_line(DATA_TAB_3, tcp.data))
                        inner_dict['TCP Data'] = format_multi_line(DATA_TAB_3, tcp.data)

            # UDP
            elif ipv4.proto == 17:
                udp = UDP(ipv4.data)
                #print(TAB_1 + 'UDP Segment:')
                #print(TAB_2 + 'Source Port: {}, Destination Port: {}, Length: {}'.format(udp.src_port, udp.dest_port, udp.size))
                inner_dict['UDP Segment'] = f'Source Port: {udp.src_port}, Destination Port: {udp.dest_port}, Length: {udp.size}'

            # Other IPv4
            else:
                #print(TAB_1 + 'Other IPv4 Data:')
                #print(format_multi_line(DATA_TAB_2, ipv4.data))
                inner_dict['Other IPv4 Data'] = format_multi_line(DATA_TAB_2, ipv4.data)

        else:
            #print('Ethernet Data:')
            #print(format_multi_line(DATA_TAB_1, eth.data))
            inner_dict['Ethernet Data'] = format_multi_line(DATA_TAB_1, eth.data)
        
        capture.append({f'Ethernet Frame {cont}':inner_dict})

    #print(capture)
    with open('capture.json', 'w') as outfile:
        json.dump(capture, outfile)

    pcap.close()

# Formats multi-line data
def format_multi_line(prefix, string, size=80):
    size -= len(prefix)
    if isinstance(string, bytes):
        string = ''.join(r'\x{:02x}'.format(byte) for byte in string)
        if size % 2:
            size -= 1
    return '\n'.join([prefix + line for line in textwrap.wrap(string, size)])


main(30) #capture during 30 seconds