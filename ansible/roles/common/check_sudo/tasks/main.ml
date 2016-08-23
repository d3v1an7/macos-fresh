---
# Fail early if no/incorrect sudo password supplied
- name: check sudo password
  become: yes
  shell: whoami
  changed_when: false
