import socket
import textwrap
import time
import json
from datetime import datetime
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
    start_time = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
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

        inner_dict = {}
        inner_dict['Description']= f'Destination: {eth.dest_mac}, Source: {eth.src_mac}, Protocol: {eth.proto}'

        # IPv4
        if eth.proto == 8:
            ipv4 = IPv4(eth.data)

            inner_dict['IPv4_Packet'] = f'Version: {ipv4.version}, Header Length: {ipv4.header_length}, TTL: { ipv4.ttl}, Protocol: {ipv4.proto}, Source: {ipv4.src}, Target: {ipv4.target}'

            # ICMP
            if ipv4.proto == 1:
                icmp = ICMP(ipv4.data)

                inner_dict['ICMP_Packet'] = f'Type: {icmp.type}, Code: {icmp.code}, Checksum: {icmp.checksum}'
                inner_dict['ICMP_Data'] = format_multi_line(icmp.data)

            # TCP
            elif ipv4.proto == 6:
                tcp = TCP(ipv4.data)
                inner_dict['TCP_Segment'] = f'Source Port: {tcp.src_port}, Destination Port: {tcp.dest_port}, Sequence: {tcp.sequence}, Acknowledgment: {tcp.acknowledgment}'
                inner_dict['TCP_flags'] = f'URG: {tcp.flag_urg}, ACK: {tcp.flag_ack}, PSH: {tcp.flag_psh}, RST: {tcp.flag_rst}, SYN: {tcp.flag_syn}, FIN:{tcp.flag_fin}'

                if len(tcp.data) > 0:

                    # HTTP
                    if tcp.src_port == 80 or tcp.dest_port == 80:
                        try:
                            http = HTTP(tcp.data)
                            http_info = str(http.data).split('\n')
                            http_data = ''
                            for line in http_info:
                                http_data += str(line)+","
                            inner_dict['HTTP_Data'] = http_info
                        except:
                            inner_dict['HTTP_Data'] = format_multi_line(DATA_TAB_3, tcp.data)
                    else:
                        inner_dict['TCP_Data'] = format_multi_line(DATA_TAB_3, tcp.data)

            # UDP
            elif ipv4.proto == 17:
                udp = UDP(ipv4.data)
                inner_dict['UDP_Segment'] = f'Source Port: {udp.src_port}, Destination Port: {udp.dest_port}, Length: {udp.size}'

            # Other IPv4
            else:
                inner_dict['Other_IPv4_Data'] = format_multi_line(DATA_TAB_2, ipv4.data)

        else:
            inner_dict['Ethernet_Data'] = format_multi_line(DATA_TAB_1, eth.data)
        
        capture.append({f'Ethernet Frame {cont}':inner_dict})

    end_time = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
    capture.insert(0,{'times':[start_time, end_time]})
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