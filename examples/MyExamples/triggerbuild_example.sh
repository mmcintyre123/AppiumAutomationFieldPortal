# triggerbuild.sh -- to trigger a build at github from shippable -- example from Low Kian Seong

curl -X POST \
-H "Content-Type: application/json" \
-H "Travis-API-Version: 3" \
-H "Accept: application/json" \
-H "Authorization: token l5VWGtZq7MPnYpo8S9AIlA" \
-d '{"request": {"message": "Triggered build from eclaim commit", "branch": "'${BRANCH:-master}'", "config": {"script": "sudo BRANCH='"$BRANCH"' docker exec -it test_centos /bin/bash -c \"source /etc/profile && export ECLAIM_BRANCH='"${BRANCH:-master}"' && export DEPLOYMENT_URL=$DEPLOYMENT_URL && /opt/miniconda2/bin/ansible-playbook -vvvvv -e '"'"'django_app_home=/opt/eclaim_revamp/eclaim app_version=eclaim_revamp db_server_ip=localhost'"'"' -i /root/django_deployment/django_app_server_db_server/deployment/tests/hosts /root/django_deployment/django_app_server_db_server/deployment/main.yml\" && sudo docker exec -it test_centos /bin/bash -l -c \"rspec /root/django_deployment/tests/spec/test_ansible_spec.rb\"&& sudo docker exec -it test_centos /bin/bash -c \"/etc/rc.d/init.d/uwsgi stop && sleep 3 && /etc/rc.d/init.d/uwsgi start\" && echo ${DOCKER_IP} && DOCKER_IP=${DOCKER_IP} nosetests -sv tests/python/verify_image.py"}}}' 'https://api.travis-ci.org/repo/censof%2Fansible-deployment/requests'

# https://raw.githubusercontent.com/censof/ansible-deployment/master/.travis.yml
